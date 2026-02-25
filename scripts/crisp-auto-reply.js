#!/usr/bin/env node

/**
 * Crisp Auto-Reply via Claude Code
 *
 * Polls Crisp for new customer messages, then launches a real Claude Code
 * process with tool access to autonomously read skills, compose, and send replies.
 *
 * Usage:
 *   node scripts/crisp-auto-reply.js          # 1 min polling (test mode)
 *   node scripts/crisp-auto-reply.js --prod    # 5 min polling (production)
 *
 * IMPORTANT: Run this in a SEPARATE terminal, not inside Claude Code.
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- Config ---
const CRISP_ID = 'e1e2b78c-2eee-4d6d-b867-92cdc81f7849';
const CRISP_KEY = 'f671ee1c30506c868df6bd911e10d9b2dfdb346cbab3a8c38c1f24a9a3385a62';
const WEBSITE_ID = 'd81825de-e162-4f20-abc6-7179519f4dd8';
const AUTH = `${CRISP_ID}:${CRISP_KEY}`;
const IS_PROD = process.argv.includes('--prod');
const POLL_INTERVAL = IS_PROD ? 5 * 60 * 1000 : 60 * 1000;
const STATE_FILE = path.join(__dirname, '.crisp-auto-reply-state.json');
const PROJECT_DIR = path.join(__dirname, '..');

// --- State ---
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return {}; }
}
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Crisp API (used only for polling, NOT for replying) ---
function crispGet(endpoint) {
  const result = execSync(
    `curl -s -u "${AUTH}" "https://api.crisp.chat/v1/website/${WEBSITE_ID}${endpoint}" -H "X-Crisp-Tier: plugin"`,
    { encoding: 'utf8', timeout: 15000 }
  );
  return JSON.parse(result);
}

// --- Get conversations needing reply ---
function getConversationsNeedingReply() {
  const state = loadState();
  const results = [];

  let resp;
  try {
    resp = crispGet('/conversations/1?filter_not_resolved=1&order_date_updated=1');
  } catch (e) {
    console.error(`  Error fetching conversations: ${e.message}`);
    return results;
  }
  if (resp.error || !resp.data || resp.data.length === 0) return results;

  const changed = resp.data.filter(conv => {
    return !state[conv.session_id] || state[conv.session_id] < conv.updated_at;
  });

  console.log(`  ${resp.data.length} unresolved, ${changed.length} changed since last poll.`);

  for (const conv of changed) {
    const sid = conv.session_id;
    const updated = conv.updated_at;

    let msgResp;
    try {
      msgResp = crispGet(`/conversation/${sid}/messages`);
    } catch (e) {
      console.error(`  Error reading messages for ${sid}: ${e.message}`);
      continue;
    }
    if (msgResp.error || !msgResp.data || msgResp.data.length === 0) continue;

    const messages = msgResp.data;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.from === 'user') {
      const meta = conv.meta || {};
      const name = meta.nickname || meta.email || 'visitor';
      results.push({ sid, name, updated });
    } else {
      state[sid] = updated;
      saveState(state);
    }
  }

  return results;
}

// --- Launch Claude Code to autonomously handle the reply ---
function handleWithClaudeCode(name, sessionId) {
  const prompt = `A customer named "${name}" has a new message on Crisp chat (session_id: ${sessionId}).

Your job:
1. Read the skill file at .claude/skills/handle-customer-support/skill.md to understand our product policies
2. Read the conversation messages from Crisp using: curl -s -u "${AUTH}" "https://api.crisp.chat/v1/website/${WEBSITE_ID}/conversation/${sessionId}/messages" -H "X-Crisp-Tier: plugin"
3. Compose a reply based on the skill knowledge and conversation context
4. Send the reply to Crisp using this pattern:
   python3 -c "import json; msg='''YOUR_REPLY'''; print(json.dumps({'type':'text','from':'operator','origin':'chat','content': msg}))" | curl -s -u "${AUTH}" -X POST "https://api.crisp.chat/v1/website/${WEBSITE_ID}/conversation/${sessionId}/message" -H "X-Crisp-Tier: plugin" -H "Content-Type: application/json" -d @-

Rules:
- Send the reply directly, do not ask for approval
- Be professional, friendly, and concise
- Answer the customer's question using the skill knowledge`;

  try {
    const cleanEnv = { ...process.env };
    delete cleanEnv.CLAUDECODE;
    delete cleanEnv.CLAUDE_CODE_ENTRYPOINT;

    console.log('  --- Claude Code start ---');
    const result = spawnSync('claude', [
      '-p', prompt,
      '--dangerously-skip-permissions'
    ], {
      encoding: 'utf8',
      cwd: PROJECT_DIR,
      timeout: 180000,
      maxBuffer: 4 * 1024 * 1024,
      env: cleanEnv
    });

    if (result.stdout) console.log(result.stdout);
    if (result.stderr && result.stderr.trim()) console.error('  STDERR:', result.stderr);
    console.log('  --- Claude Code end ---');

    if (result.error) throw result.error;
    return result.status === 0;
  } catch (e) {
    console.error(`  Claude Code error: ${e.message}`);
    return false;
  }
}

// --- Main poll ---
function poll() {
  const now = new Date().toISOString();
  console.log(`\n[${now}] Polling Crisp for new messages...`);

  let conversations;
  try {
    conversations = getConversationsNeedingReply();
  } catch (e) {
    console.error(`  Poll error: ${e.message}`);
    return;
  }

  if (conversations.length === 0) {
    console.log('  No new messages needing reply.');
    return;
  }

  console.log(`  Found ${conversations.length} conversation(s) needing reply.`);
  const state = loadState();

  for (const conv of conversations) {
    console.log(`\n  📩 New message from: ${conv.name}`);
    console.log(`  🤖 Launching Claude Code to handle autonomously...`);

    const success = handleWithClaudeCode(conv.name, conv.sid);

    if (success) {
      console.log('  ✅ Claude Code finished.');
      state[conv.sid] = conv.updated;
      saveState(state);
    } else {
      console.log('  ❌ Claude Code failed.');
    }
  }
}

// --- Lock file to prevent duplicate processes ---
const LOCK_FILE = path.join(__dirname, '.crisp-auto-reply.lock');

function acquireLock() {
  try {
    // O_EXCL fails if file already exists
    const fd = fs.openSync(LOCK_FILE, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
    fs.writeSync(fd, String(process.pid));
    fs.closeSync(fd);
    return true;
  } catch {
    // Lock file exists — check if the process is still alive
    try {
      const pid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8').trim());
      process.kill(pid, 0); // throws if process doesn't exist
      console.error(`❌ Another instance is already running (PID ${pid}). Exiting.`);
      return false;
    } catch {
      // Stale lock — previous process died, take over
      fs.writeFileSync(LOCK_FILE, String(process.pid));
      return true;
    }
  }
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch {}
}

process.on('exit', releaseLock);
process.on('SIGINT', () => { releaseLock(); process.exit(0); });
process.on('SIGTERM', () => { releaseLock(); process.exit(0); });

// --- Start ---
if (!acquireLock()) process.exit(1);

console.log('🤖 Crisp Auto-Reply (Claude Code Autonomous Mode)');
console.log(`   Mode: ${IS_PROD ? 'Production (5 min)' : 'Test (1 min)'}`);
console.log(`   State: ${STATE_FILE}`);
console.log('   NOTE: Claude Code will read skills and send replies itself.\n');

// Initialize state if empty
const state = loadState();
if (Object.keys(state).length === 0) {
  console.log('   Initializing state — marking existing conversations as seen...');
  try {
    const resp = crispGet('/conversations/1?filter_not_resolved=1&order_date_updated=1');
    if (!resp.error && resp.data) {
      for (const conv of resp.data) {
        state[conv.session_id] = conv.updated_at;
      }
    }
    saveState(state);
    console.log(`   Marked ${Object.keys(state).length} existing conversations as seen.`);
  } catch (e) {
    console.error(`   Init error: ${e.message}`);
  }
}

// Run first poll immediately, then on interval
poll();
setInterval(poll, POLL_INTERVAL);
