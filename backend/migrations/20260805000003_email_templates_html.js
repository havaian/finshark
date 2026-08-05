/* eslint-disable camelcase */

// Styled HTML bodies for every email template.
//
// The email_templates table has had html_en / html_ru / html_uz columns since
// the original billing migration, and nothing ever wrote to them - every email
// went out as bare text/plain. This fills them in with markup that matches the
// app: same palette, same type scale, same rounded-card shape the UI uses.
//
// The copy is NOT rewritten. Each language's HTML is built from that language's
// EXISTING body_* column, so:
//   - no new English, Russian or Uzbek copy is invented here
//   - translation parity is whatever it already was; a language with a null
//     body gets a null html, and stays hidden rather than falling back
//   - a later edit through the admin panel is still the source of truth, since
//     this runs once
//
// Structure is inferred from the plain-text body, which every template already
// follows:
//   <greeting>\n\n<paragraph>...\n\n<label>: <url>\n\n- Finshark
//   [\n\n--\n<unsubscribe line>]
// The "<label>: <url>" block becomes the CTA button, "- Finshark" becomes the
// brand footer, and anything after "--" becomes the fine print.
//
// Email client constraints this markup obeys:
//   - tables for layout, no flexbox or grid
//   - every style inline, no <style> block and no CSS variables
//   - no web fonts; Geist is requested first and degrades to the system stack
//   - explicit background on every cell, because a dark shell with an unpainted
//     cell reads as a white stripe in several clients

exports.shorthands = undefined;

// Palette lifted from frontend/src/styles/base.css (dark theme, which is the
// app's default surface). Kept as literals because email has no CSS variables.
const C = {
  bg: '#0a0a0a',
  card: '#131316',
  elev: '#1c1c20',
  border: '#2a2a30',
  text: '#f5f5f7',
  dim: '#a0a0a8',
  mute: '#6a6a73',
  accent: '#5d9985',
  accentHot: '#7ab5a0',
  accentDeep: '#3f6b5b',
};

const FONT =
  "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(s) {
  // Placeholders like {{display_name}} pass through untouched: braces are not
  // HTML-special, so substitution still works on the rendered markup.
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Splits a plain-text body into the pieces the layout needs.
function parseBody(body) {
  const normalised = body.replace(/\r\n/g, '\n');

  // Fine print lives after a "--" separator line (the unsubscribe footer on
  // reminder templates). Everything before it is the message proper.
  let main = normalised;
  let fine = null;
  const sepIndex = normalised.indexOf('\n\n--\n');
  if (sepIndex !== -1) {
    main = normalised.slice(0, sepIndex);
    fine = normalised.slice(sepIndex + 5).trim();
  }

  const blocks = main
    .split('\n\n')
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  let greeting = null;
  let signature = null;
  let cta = null;
  const paragraphs = [];

  for (const block of blocks) {
    if (greeting === null) {
      greeting = block;
      continue;
    }
    if (/^-\s+\S/.test(block) && block.length < 40) {
      signature = block.replace(/^-\s+/, '');
      continue;
    }
    // "Start studying: {{app_url}}/dashboard" -> button labelled
    // "Start studying" pointing at that URL.
    const ctaMatch = block.match(/^(.+?):\s+(\{\{\s*\w+\s*\}\}\S*)$/);
    if (ctaMatch && cta === null) {
      cta = { label: ctaMatch[1].trim(), href: ctaMatch[2].trim() };
      continue;
    }
    paragraphs.push(block);
  }

  return { greeting, paragraphs, cta, signature, fine };
}

function renderHtml(subject, body) {
  const { greeting, paragraphs, cta, signature, fine } = parseBody(body);

  const paragraphHtml = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${C.dim};">${escapeHtml(
          p
        ).replace(/\n/g, '<br />')}</p>`
    )
    .join('');

  // Bulletproof-ish button: a table cell with its own background, so clients
  // that strip the anchor's padding still render a filled block.
  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
            <tr>
              <td align="center" bgcolor="${C.accent}" style="background-color:${C.accent};border-radius:10px;">
                <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:15px;font-weight:600;color:${C.bg};text-decoration:none;border-radius:10px;">${escapeHtml(
          cta.label
        )}</a>
              </td>
            </tr>
          </table>`
    : '';

  const signatureHtml = signature
    ? `<p style="margin:24px 0 0;font-size:14px;color:${C.mute};">${escapeHtml(signature)}</p>`
    : '';

  // Links inside the fine print (the unsubscribe URL) are left as plain text:
  // the placeholder is substituted at send time and clients auto-link it.
  const fineHtml = fine
    ? `<tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${C.mute};">${escapeHtml(
        fine
      ).replace(/\n/g, '<br />')}</p>
            </td>
          </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:${C.card};border:1px solid ${C.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:26px 32px 0;">
              <span style="font-family:${FONT};font-size:17px;font-weight:700;color:${C.text};letter-spacing:-0.01em;">Finshark</span>
              <span style="font-size:17px;">&#129416;</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0;">
              <div style="height:1px;background-color:${C.border};line-height:1px;font-size:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 4px;font-family:${FONT};">
              <p style="margin:0 0 18px;font-size:19px;font-weight:600;line-height:1.35;color:${C.text};letter-spacing:-0.01em;">${escapeHtml(
                greeting ?? ''
              )}</p>
              ${paragraphHtml}
              ${ctaHtml}
              ${signatureHtml}
            </td>
          </tr>
          <tr><td style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>
          ${fineHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

exports.up = async (pgm) => {
  const { rows } = await pgm.db.query(`
    SELECT key, subject_en, subject_ru, subject_uz, body_en, body_ru, body_uz
    FROM email_templates
  `);

  for (const row of rows) {
    // Per language: a null body stays a null html. Never synthesise a body
    // that does not exist, which would defeat the hide-untranslated policy.
    const htmlEn = renderHtml(row.subject_en, row.body_en);
    const htmlRu =
      row.body_ru === null ? null : renderHtml(row.subject_ru ?? row.subject_en, row.body_ru);
    const htmlUz =
      row.body_uz === null ? null : renderHtml(row.subject_uz ?? row.subject_en, row.body_uz);

    await pgm.db.query(
      `UPDATE email_templates
          SET html_en = $2, html_ru = $3, html_uz = $4
        WHERE key = $1`,
      [row.key, htmlEn, htmlRu, htmlUz]
    );
  }
};

exports.down = (pgm) => {
  // Back to text-only. The plain body columns were never touched, so nothing
  // is lost by clearing these.
  pgm.sql(`
    UPDATE email_templates
       SET html_en = NULL, html_ru = NULL, html_uz = NULL
  `);
};
