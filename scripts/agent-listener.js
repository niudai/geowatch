#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// Monitor this directory for new customer messages
const MESSAGES_DIR = '/tmp/geowatch-messages';
const PROCESSED_FILE = path.join(os.homedir(), '.geowatch-processed-messages');

// Keep track of processed messages
let processedMessages = new Set();
if (fs.existsSync(PROCESSED_FILE)) {
  const content = fs.readFileSync(PROCESSED_FILE, 'utf-8');
  processedMessages = new Set(content.split('\n').filter(Boolean));
}

console.log('[Agent Listener] Starting...');
console.log(`[Monitor] Watching ${MESSAGES_DIR}`);

// Create messages dir if needed
if (!fs.existsSync(MESSAGES_DIR)) {
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
}

function processMessage(filePath) {
  if (processedMessages.has(filePath)) {
    return; // Already processed
  }

  console.log(`\n[New Message] ${filePath}`);

  try {
    const messageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const prompt = `
[CUSTOMER SUPPORT - AUTO TRIGGERED]

Customer ID: ${messageData.customer_id}
Customer Name: ${messageData.customer_name}
Message: "${messageData.message}"
Timestamp: ${messageData.timestamp}

---

Please use the /handle-customer-support skill to:
1. Analyze this customer message
2. Investigate if code changes are needed
3. Generate a professional response
4. If you fix code, commit and push to main

Be thorough and professional. The customer is waiting for a response.
    `.trim();

    console.log('[Executing] claude-code /handle-customer-support');

    // Trigger claude-code with --print mode (non-interactive)
    const claudeProcess = spawn('claude-code', [
      '--print',
      '-p',
      '--output-format=json',
      '/handle-customer-support',
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..'),
    });

    let output = '';
    let errorOutput = '';

    claudeProcess.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    claudeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });

    // Send the prompt to claude-code via stdin
    claudeProcess.stdin.write(prompt);
    claudeProcess.stdin.end();

    claudeProcess.on('close', (code) => {
      console.log(`\n[Done] Claude Code exited with code ${code}`);

      try {
        // Parse the JSON response
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const response = JSON.parse(jsonMatch[0]);
          console.log('[Response]', JSON.stringify(response, null, 2));

          // Send response back to Intercom
          sendToIntercom(messageData.customer_id, response.response);
        }
      } catch (e) {
        console.error('[Parse Error]', e.message);
      }

      // Mark as processed
      processedMessages.add(filePath);
      fs.appendFileSync(PROCESSED_FILE, filePath + '\n');
    });

  } catch (error) {
    console.error('[Error processing message]', error.message);
  }
}

async function sendToIntercom(conversationId, message) {
  if (!process.env.INTERCOM_TOKEN) {
    console.log('[Warning] INTERCOM_TOKEN not set, skipping sending to Intercom');
    return;
  }

  try {
    const response = await fetch(
      `https://api.intercom.io/conversations/${conversationId}/parts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.INTERCOM_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_type: 'comment',
          type: 'admin',
          body: message,
        }),
      }
    );

    if (response.ok) {
      console.log('[Intercom] Message sent successfully');
    } else {
      console.error('[Intercom] Failed to send:', response.statusText);
    }
  } catch (error) {
    console.error('[Intercom Error]', error.message);
  }
}

// Watch for new message files
fs.watch(MESSAGES_DIR, (eventType, filename) => {
  if (eventType === 'rename' || eventType === 'change') {
    const filePath = path.join(MESSAGES_DIR, filename);
    if (fs.existsSync(filePath) && filename.startsWith('message-')) {
      // Small delay to ensure file is fully written
      setTimeout(() => processMessage(filePath), 500);
    }
  }
});

console.log('[Ready] Listening for customer messages...');
console.log('[Tip] To test, run:');
console.log(`  echo '{"customer_id":"test","customer_name":"John","message":"Help!"}' > ${MESSAGES_DIR}/message-test-123.json`);
