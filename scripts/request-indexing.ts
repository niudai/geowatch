/**
 * Google Search Indexing API - Auto-submit blog URLs for indexing
 *
 * Usage:
 *   # Submit all blog posts (auto-detect from content/blog/)
 *   npx tsx scripts/request-indexing.ts
 *
 *   # Submit specific URLs
 *   npx tsx scripts/request-indexing.ts https://geowatch.ai/blog/my-post
 *
 * Setup: gsc-service-account.json must exist in project root
 * (Service Account must be added as Owner in Google Search Console)
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const SITE_BASE = "https://geowatch.ai";
const KEY_FILE = join(process.cwd(), "gsc-service-account.json");
const BLOG_DIR = join(process.cwd(), "content/blog");
const INDEXING_API = "https://indexing.googleapis.com/v3/urlNotifications:publish";

// ── Auth ─────────────────────────────────────────────────────────────────────

function getAccessToken(): string {
  if (!existsSync(KEY_FILE)) {
    throw new Error(`Service account key not found: ${KEY_FILE}`);
  }

  const key = JSON.parse(readFileSync(KEY_FILE, "utf-8"));

  // Build JWT manually (no extra deps needed)
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const header = { alg: "RS256", typ: "JWT" };
  const b64 = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsigned = `${b64(header)}.${b64(payload)}`;

  // Use node crypto to sign with RS256
  const crypto = require("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(key.private_key, "base64url");
  const jwt = `${unsigned}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = JSON.parse(
    execSync(
      `curl -s -X POST https://oauth2.googleapis.com/token \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}"`
    ).toString()
  );

  if (!tokenRes.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenRes)}`);
  }

  return tokenRes.access_token;
}

// ── URL detection ─────────────────────────────────────────────────────────────

function getBlogUrls(): string[] {
  if (!existsSync(BLOG_DIR)) {
    console.log(`Blog dir not found: ${BLOG_DIR}`);
    return [];
  }

  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.(mdx|md)$/, "");
      return `${SITE_BASE}/blog/${slug}`;
    });
}

// ── Submit URL ────────────────────────────────────────────────────────────────

async function submitUrl(url: string, token: string): Promise<void> {
  const body = JSON.stringify({ url, type: "URL_UPDATED" });

  const result = execSync(
    `curl -s -X POST "${INDEXING_API}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${token}" \
      -d '${body}'`
  ).toString();

  const res = JSON.parse(result);

  if (res.error) {
    console.error(`  ❌ ${url}`);
    console.error(`     ${res.error.message}`);
  } else {
    const notifyTime = res.urlNotificationMetadata?.latestUpdate?.notifyTime || "submitted";
    console.log(`  ✅ ${url}`);
    console.log(`     notifyTime: ${notifyTime}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Determine URLs to submit
  const cliUrls = process.argv.slice(2).filter((a) => a.startsWith("http"));
  const urls = cliUrls.length > 0 ? cliUrls : getBlogUrls();

  if (urls.length === 0) {
    console.log("No URLs to submit.");
    process.exit(0);
  }

  console.log(`\n🔍 Google Indexing API — submitting ${urls.length} URL(s)\n`);

  // Get access token once
  let token: string;
  try {
    token = getAccessToken();
    console.log("🔑 Auth OK\n");
  } catch (e: any) {
    console.error("❌ Auth failed:", e.message);
    process.exit(1);
  }

  // Submit each URL
  for (const url of urls) {
    await submitUrl(url, token);
    // Small delay to respect rate limits (200 URLs/day quota)
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n✨ Done. ${urls.length} URL(s) submitted to Google Indexing API.`);
  console.log(`   Note: Service account must be Owner in Search Console for indexing to work.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
