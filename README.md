# IESW 2026 — Registration Landing Page
**Pace Digitek × IESA × Lineage Power**

A self-hosted visitor registration page for the expo stall at IESW 2026.
Saves every submission to Google Sheets and sends a confirmation email to the visitor + an internal alert to your team.

---

## Project Structure

```
iesw-project/
├── public/
│   └── index.html       ← Frontend (open in browser)
├── server.js            ← Node.js backend
├── package.json
├── .env.example         ← Copy this to .env and fill in values
└── .gitignore
```

---

## Setup (one-time)

### 1. Install Node.js
Download from https://nodejs.org (choose LTS version).

### 2. Install dependencies
Open a terminal in this folder and run:
```bash
npm install
```

### 3. Set up Google Sheets

**Create the spreadsheet:**
1. Go to [sheets.google.com](https://sheets.google.com) → create a new sheet
2. In row 1, add these headers (A to J):
   `Timestamp | First Name | Last Name | Email | Phone | Company | Designation | Sector | Interest | Message`
3. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

**Create a Service Account:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. `iesw-registration`)
3. Go to **APIs & Services → Enable APIs** → enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts** → Create Service Account
5. Click the account → **Keys** tab → **Add Key → JSON** → download the file
6. Open the JSON file — copy `client_email` and `private_key` to your `.env`

**Share the sheet:**
- Open your Google Sheet → Share → paste the `client_email` → set role to **Editor**

---

### 4. Set up Gmail for sending emails

1. Use a Gmail account (recommended: create a dedicated one like `iesw2026@gmail.com`)
2. Enable **2-Step Verification** at [myaccount.google.com/security](https://myaccount.google.com/security)
3. Go to **Security → App Passwords**
4. Select app: **Mail**, device: **Other** → name it `IESW Registration`
5. Copy the 16-character password into your `.env` as `GMAIL_APP_PASSWORD`

---

### 5. Create your .env file
```bash
cp .env.example .env
```
Open `.env` and fill in all the values.

---

## Running the server

### Development (auto-restarts on file changes):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Then open **http://localhost:3000** in your browser.

---

## Using at the Expo

- Connect a laptop/tablet to WiFi at the venue
- Run `npm start` — the page opens at `http://localhost:3000`
- Hand the device to visitors or display it on a tablet stand
- All submissions go to your Google Sheet in real time
- The visitor gets a confirmation email; your team gets an internal alert

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module` error | Run `npm install` first |
| Google Sheets error | Check `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and that the sheet is shared with the service account |
| Email not sending | Confirm `GMAIL_APP_PASSWORD` is the App Password (not your Gmail login). Make sure 2FA is enabled. |
| Port already in use | Change `PORT=3000` to `PORT=3001` in `.env` |
