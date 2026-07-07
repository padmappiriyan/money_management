# Email setup (Gmail SMTP)

When an admin creates a user, the system sends a **welcome email** with login credentials (email + temporary password) using **Gmail SMTP**.

---

## What you need

1. A **Google account** used to send mail (e.g. `noreply@yourcompany.com` or a dedicated Gmail).
2. **2-Step Verification** enabled on that Google account.
3. A **Gmail App Password** (not your normal Gmail password).

---

## Step 1 — Enable 2-Step Verification

1. Open [Google Account → Security](https://myaccount.google.com/security).
2. Under **How you sign in to Google**, turn on **2-Step Verification** and complete setup.

---

## Step 2 — Create an App Password

1. Go to [App passwords](https://myaccount.google.com/apppasswords) (you must have 2-Step Verification on).
2. Select app: **Mail**.
3. Select device: **Other** → name it e.g. `MTTMS Backend`.
4. Click **Generate**.
5. Copy the **16-character password** (shown once). You will use this as `SMTP_PASS`.

> If you do not see App passwords, your Google Workspace admin may need to allow them, or use a personal Gmail for testing.

---

## Step 3 — Configure `backend/.env`

Copy variables from `.env.example` into your real `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="BONTECH <your.email@gmail.com>"
APP_NAME=BONTECH
FRONTEND_URL=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `SMTP_USER` | Gmail address used to authenticate |
| `SMTP_PASS` | **App Password** (16 chars, spaces optional) |
| `EMAIL_FROM` | “From” name shown to recipients |
| `APP_NAME` | Used in email subject/body |
| `FRONTEND_URL` | Login link in the email (no trailing slash required) |
| `TEST_EMAIL` | Optional — where `npm run test:email` sends a test message |

**Restart the backend** after changing `.env`.

On startup you should see:

```
[Email] SMTP configured: true
[Email] SMTP connection verified successfully. { host: 'smtp.gmail.com', ... }
```

If you see `SMTP configured: false`, welcome emails will not send when creating users (only `npm run test:email` may work if you run it with `--env-file` separately).

---

## Step 4 — Test the connection

From the `backend` folder:

```bash
npm run test:email
```

- **Success:** `SMTP OK` and `Test email sent successfully` — check the inbox (and spam).
- **Failure:** read the error; common fixes are below.

---

## Step 5 — Verify in the app

1. Log in as **admin**.
2. Open **Users** → **Create User**.
3. Fill name, email, temporary password, role → **Create Account**.
4. The new user should receive an email with:
   - **Login (email)** — same as the address you entered
   - **Temporary password**
   - Link to sign in (`FRONTEND_URL/login`)

If the user is created but email fails, the UI shows a warning; the account still exists.

---

## Production notes

| Topic | Recommendation |
|-------|----------------|
| **Sender address** | Prefer a company domain (`noreply@yourcompany.com`) with Google Workspace or a transactional provider (SendGrid, SES) for better deliverability. |
| **FRONTEND_URL** | Set to your real app URL, e.g. `https://app.yourcompany.com`. |
| **Secrets** | Never commit `.env` or App Passwords to git. |
| **Gmail limits** | Personal Gmail: ~500 emails/day. High volume → use SendGrid/SES instead. |
| **Spam** | Ask IT to configure SPF/DKIM if using a custom domain. |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Invalid login` / `535 Authentication failed` | Use an **App Password**, not your normal Gmail password. |
| `SMTP_USER and SMTP_PASS are not set` | Add both to `backend/.env` and restart the server. |
| `Connection timeout` | Check firewall; port **587** (TLS) or try `SMTP_PORT=465` and `SMTP_SECURE=true`. |
| Email in **spam** | Mark as not spam; improve `EMAIL_FROM` and domain reputation. |
| User created, no email | Restart backend; confirm startup shows `[Email] SMTP configured: true`. Create user and check for `[User] createUser request received` and `[Email] Sending welcome...` in the terminal. |
| No `[Email]` logs at all | Frontend may be calling a different API URL — set `VITE_API_BASE_URL=http://localhost:5000/api` in `frontend/.env` and restart Vite. |
| `Less secure app access` | Google removed this; **App Passwords** are required instead. |

---

## Files involved

| File | Purpose |
|------|---------|
| `services/emailService.js` | Nodemailer + Gmail transport |
| `templates/welcomeUserEmail.js` | Email HTML/text template |
| `controllers/userController.js` | Sends email after `POST /api/users` |
| `workers/userWorker.js` | Sends email after bulk CSV import |
| `scripts/testEmail.js` | SMTP test script |

---

## Optional: Google Workspace

If you use **Google Workspace** (not @gmail.com):

- `SMTP_USER` = your workspace email.
- App Password steps are the same if allowed by admin.
- Some orgs block SMTP; ask admin to enable **SMTP relay** or use a dedicated transactional email service.
