import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'GeoWatch <alerts@notifications.geowatch.ai>'

interface AppReport {
  appName: string
  keywordsChecked: number
  mentions: number
  totalResults: number
  results: {
    keyword: string
    source: string
    mentioned: boolean
  }[]
}

interface AuditEmailData {
  userName: string
  userEmail: string
  date: string
  apps: AppReport[]
  totalKeywords: number
  totalMentions: number
  totalResults: number
  errors: string[]
}

function buildAuditHtml(data: AuditEmailData): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://geowatch.ai'

  const appRows = data.apps
    .map((app) => {
      const mentionRate =
        app.totalResults > 0
          ? Math.round((app.mentions / app.totalResults) * 100)
          : 0
      const mentionColor = mentionRate >= 50 ? '#34d399' : mentionRate > 0 ? '#fbbf24' : '#f87171'

      const keywordRows = app.results
        .map(
          (r) =>
            `<tr>
              <td style="padding:6px 12px;border-bottom:1px solid #27272a;color:#d4d4d8;font-size:13px;">${r.keyword}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #27272a;color:#a1a1aa;font-size:13px;">${r.source === 'google_ai_mode' ? 'Google AI' : 'ChatGPT'}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #27272a;text-align:center;">
                <span style="color:${r.mentioned ? '#34d399' : '#f87171'};font-weight:600;font-size:13px;">${r.mentioned ? 'Yes' : 'No'}</span>
              </td>
            </tr>`
        )
        .join('')

      return `
        <div style="background:#18181b;border:1px solid #3f3f46;border-radius:12px;padding:20px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <h3 style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">${app.appName}</h3>
            <span style="color:${mentionColor};font-size:14px;font-weight:600;">${mentionRate}% mention rate</span>
          </div>
          <div style="display:flex;gap:24px;margin-bottom:14px;">
            <div>
              <span style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Keywords</span>
              <div style="color:#ffffff;font-size:18px;font-weight:700;">${app.keywordsChecked}</div>
            </div>
            <div>
              <span style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Mentions</span>
              <div style="color:#34d399;font-size:18px;font-weight:700;">${app.mentions}/${app.totalResults}</div>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:6px 12px;text-align:left;color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #3f3f46;">Keyword</th>
                <th style="padding:6px 12px;text-align:left;color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #3f3f46;">Source</th>
                <th style="padding:6px 12px;text-align:center;color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #3f3f46;">Mentioned</th>
              </tr>
            </thead>
            <tbody>${keywordRows}</tbody>
          </table>
        </div>`
    })
    .join('')

  const errorSection =
    data.errors.length > 0
      ? `<div style="background:#2a1215;border:1px solid #7f1d1d;border-radius:8px;padding:12px 16px;margin-top:16px;">
          <p style="color:#fca5a5;font-size:13px;font-weight:600;margin:0 0 8px;">Errors (${data.errors.length})</p>
          ${data.errors.map((e) => `<p style="color:#fca5a5;font-size:12px;margin:2px 0;">${e}</p>`).join('')}
        </div>`
      : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px;">GeoWatch Daily Report</h1>
      <p style="color:#71717a;font-size:13px;margin:0;">${data.date}</p>
    </div>

    <!-- Summary Stats -->
    <div style="background:#18181b;border:1px solid #3f3f46;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px;">
            <div style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Apps</div>
            <div style="color:#ffffff;font-size:24px;font-weight:700;">${data.apps.length}</div>
          </td>
          <td style="padding:8px;">
            <div style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Keywords</div>
            <div style="color:#ffffff;font-size:24px;font-weight:700;">${data.totalKeywords}</div>
          </td>
          <td style="padding:8px;">
            <div style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Mentions</div>
            <div style="color:#34d399;font-size:24px;font-weight:700;">${data.totalMentions}</div>
          </td>
          <td style="padding:8px;">
            <div style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Mention Rate</div>
            <div style="color:#22d3ee;font-size:24px;font-weight:700;">${data.totalResults > 0 ? Math.round((data.totalMentions / data.totalResults) * 100) : 0}%</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Per-app reports -->
    ${appRows}

    ${errorSection}

    <!-- CTA -->
    <div style="text-align:center;margin-top:32px;">
      <a href="${appUrl}/dashboard" style="display:inline-block;background:#22d3ee;color:#000000;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">View Full Dashboard</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #27272a;">
      <p style="color:#52525b;font-size:11px;margin:0;">Sent by <a href="${appUrl}" style="color:#22d3ee;text-decoration:none;">GeoWatch</a> &mdash; AI Search Visibility Monitoring</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendAuditEmail(data: AuditEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set, skipping audit email')
    return
  }

  const html = buildAuditHtml(data)
  const mentionRate =
    data.totalResults > 0
      ? Math.round((data.totalMentions / data.totalResults) * 100)
      : 0

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: data.userEmail,
    subject: `GeoWatch Report: ${data.totalMentions}/${data.totalResults} mentions (${mentionRate}%) — ${data.date}`,
    html,
  })

  if (error) {
    console.error('[Email] Failed to send audit email:', error)
  } else {
    console.log(`[Email] Audit email sent to ${data.userEmail}`)
  }
}

export type { AuditEmailData, AppReport }
