import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Temporary storage for messages (use Neon DB in production)
const MESSAGES_DIR = '/tmp/geowatch-messages';

if (!fs.existsSync(MESSAGES_DIR)) {
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversation_id, body, author_name } = req.body;

  console.log(`[Intercom Webhook] New message from ${author_name}`);

  try {
    // Create a message file that claude-code can read
    const messageFile = path.join(
      MESSAGES_DIR,
      `message-${conversation_id}-${Date.now()}.json`
    );

    const messageContent = {
      customer_id: conversation_id,
      customer_name: author_name,
      message: body,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(messageFile, JSON.stringify(messageContent, null, 2));

    console.log(`[Message stored] ${messageFile}`);

    // Trigger claude-code to handle this locally
    // This works because: claude-code --print reads stdin or file
    // In production, you'd trigger this via a webhook to your local machine
    console.log(`[Trigger] Waiting for local agent to process...`);

    // For now, just acknowledge receipt
    res.status(200).json({
      ok: true,
      message_file: messageFile,
      instruction: 'Run: cat {message_file} | claude-code --print /handle-customer-support'
    });

  } catch (error) {
    console.error('[Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
