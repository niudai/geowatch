# 🤖 GeoWatch Autonomous Customer Support System

This system allows Claude Code to automatically handle customer support messages from Intercom/Crisp.

## Architecture

```
Customer sends message to Intercom
    ↓
Webhook: /api/webhook/intercom
    ↓
Creates message file: /tmp/geowatch-messages/message-*.json
    ↓
Local listener (agent-listener.js) detects new file
    ↓
Triggers: claude-code /handle-customer-support
    ↓
Claude Code processes and responds
    ↓
Response sent back to Intercom
```

## Setup

### 1. Start the Agent Listener

Run this in your development environment (locally):

```bash
pnpm agent:listen
```

Output:
```
[Agent Listener] Starting...
[Monitor] Watching /tmp/geowatch-messages
[Ready] Listening for customer messages...
```

**Keep this running 24/7** (you can use `screen`, `tmux`, or systemd service).

### 2. Configure Intercom Webhook

In Intercom settings, add webhook:
```
URL: https://your-geowatch-domain.vercel.app/api/webhook/intercom
Events: conversation.user.created
Headers:
  Authorization: Bearer YOUR_INTERCOM_TOKEN
```

Body format sent:
```json
{
  "conversation_id": "conv_123",
  "author_name": "John Doe",
  "body": "Your message here"
}
```

### 3. Set INTERCOM_TOKEN

```bash
export INTERCOM_TOKEN=your_intercom_access_token
```

## Testing

### Manual Test

```bash
pnpm agent:test
```

This creates a test message. Watch the listener handle it.

### Simulate Real Message

```bash
cat > /tmp/geowatch-messages/message-manual.json << 'EOF'
{
  "customer_id": "cust_demo_001",
  "customer_name": "Alice Johnson",
  "message": "The dashboard shows 0% visibility. Is this a bug?",
  "timestamp": "2026-02-22T10:30:00Z"
}
EOF
```

The listener will immediately trigger `claude-code /handle-customer-support` with this message.

## How It Works

1. **File Watcher** (`agent-listener.js`)
   - Monitors `/tmp/geowatch-messages/` for new files
   - Detects when a message file appears
   - Passes message to Claude Code

2. **Claude Code Handler** (`/handle-customer-support` skill)
   - Reads the customer message
   - Analyzes the issue
   - Can modify code, run tests, deploy if needed
   - Returns JSON response with:
     - Customer response text
     - Action taken (bug fix, feature info, etc.)
     - Whether code was changed/deployed

3. **Response Flow**
   - Claude Code outputs JSON with customer response
   - Listener parses the response
   - Sends back to Intercom via API
   - Marks message as processed

## Response Format

Claude Code returns:
```json
{
  "customer_id": "cust_123",
  "status": "resolved|in_progress|needs_escalation",
  "response": "Thanks for reaching out! I've investigated the issue...",
  "action_taken": "Fixed visibility calculation bug in Features.tsx",
  "code_changed": true,
  "deployed": true
}
```

## Environment Variables

```bash
# Required for sending responses back to Intercom
INTERCOM_TOKEN=your_token

# Optional for Vercel deployment logs
VERCEL_TOKEN=your_token
```

## Troubleshooting

### "Claude Code cannot be launched inside another Claude Code session"
This is expected when running from within Claude Code. The listener script must run in a **separate shell/process**, not within Claude Code.

### "INTERCOM_TOKEN not set"
The listener will still work but won't send responses back to Intercom. Set the token if you want auto-responses.

### Message file not being processed
Check:
1. File exists in `/tmp/geowatch-messages/`
2. Filename starts with `message-`
3. JSON is valid
4. Check listener logs for errors

### Claude Code not responding
Check:
1. `claude-code` command is available: `which claude-code`
2. Skill `/handle-customer-support` exists
3. You're not inside another Claude Code session (listener must be in separate shell)

## Advanced: Systemd Service

Make it persistent on Linux/Mac:

```ini
# ~/.config/systemd/user/geowatch-agent.service
[Unit]
Description=GeoWatch Customer Support Agent
After=network.target

[Service]
Type=simple
WorkingDirectory=/Users/sheldonniu/code/geowatch
ExecStart=/usr/bin/node scripts/agent-listener.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
```

Then:
```bash
systemctl --user enable geowatch-agent
systemctl --user start geowatch-agent
systemctl --user status geowatch-agent
```

## Production Considerations

- **Database**: Use Neon instead of `/tmp/` for messages
- **Message Queue**: Redis or Bull for reliability
- **Auth**: Verify webhook signatures from Intercom
- **Rate Limiting**: Protect API from abuse
- **Monitoring**: Track response times and failures
- **Logging**: Use structured logging to Vercel or DataDog
