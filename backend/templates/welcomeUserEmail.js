/**
 * Welcome email sent when an admin creates a new user account.
 */
export function buildWelcomeUserEmail({ appName, loginUrl, name, email, password, role }) {
  const roleLabel = role === 'supervisor' ? 'Supervisor' : 'User';

  const subject = `Your ${appName} account has been created`;

  const text = [
    `Hello ${name},`,
    '',
    `An administrator has created your ${appName} account.`,
    '',
    'Your login credentials:',
    `  Login (email): ${email}`,
    `  Temporary password: ${password}`,
    `  Role: ${roleLabel}`,
    '',
    `Sign in here: ${loginUrl}`,
    '',
    'For security, you will be asked to change your password on first login.',
    '',
    'If you did not expect this email, please contact your administrator.',
    '',
    `— ${appName} Team`,
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#5B58EB,#4F46E5);padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Welcome to ${appName}</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Your account is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Hello <strong>${escapeHtml(name)}</strong>,</p>
              <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
                An administrator has created your account. Use the credentials below to sign in.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Login credentials</p>
                    <p style="margin:0 0 8px;color:#1e293b;font-size:14px;"><strong>Login (email):</strong> ${escapeHtml(email)}</p>
                    <p style="margin:0 0 8px;color:#1e293b;font-size:14px;"><strong>Temporary password:</strong> <code style="background:#e2e8f0;padding:2px 8px;border-radius:4px;font-size:13px;">${escapeHtml(password)}</code></p>
                    <p style="margin:0;color:#1e293b;font-size:14px;"><strong>Role:</strong> ${escapeHtml(roleLabel)}</p>
                  </td>
                </tr>
              </table>
              <a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#5B58EB;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 28px;border-radius:10px;">Sign in to ${escapeHtml(appName)}</a>
              <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
                You will be prompted to change your password on first login. If you did not expect this email, contact your administrator.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">© ${new Date().getFullYear()} ${escapeHtml(appName)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  return { subject, text, html };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
