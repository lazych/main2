# Database Backups with SimpleBackups

This project is configured to work with [SimpleBackups](https://simplebackups.com) for automatic PostgreSQL database backups.

## Setup Instructions

Since Prisma does not manage backups directly, we use SimpleBackups to connect to the database and pull backups on a schedule.

### 1. Create a SimpleBackups Account
1. Go to [SimpleBackups.com](https://simplebackups.com) and sign up.

### 2. Connect Your Database
You will need your connection details. These are found in your `.env` file under `DATABASE_URL`.
Format: `postgres://USER:PASSWORD@HOST:PORT/DATABASE`

In SimpleBackups:
1. Click **Connect a Database**.
2. Choose **PostgreSQL**.
3. Fill in the details:
   - **Host**: The host from your URL (e.g., `aws-0-us-east-1.pooler.neon.tech`).
   - **User**: The username (first part after `://`).
   - **Password**: The password (between `:` and `@`).
   - **Database**: The database name (last part after `/`).
   - **Port**: Usually `5432` or `6543`.

### 3. Schedule the Backup
1. creating a new Backup Job.
2. Select your Database.
3. Select your Storage (S3, Google Drive, Dropbox, etc., or SimpleBackups storage).
4. Set the schedule (e.g., Daily at 12:00 AM).

### 4. Enable "On-Demand" Triggers (Optional)
To allow the admin dashboard to trigger backups (using the API route we created):
1. In the SimpleBackups dashboard, go to your Backup Job settings.
2. Look for **"Backup Trigger URL"** or **"Webhook Trigger"**.
3. Copy this URL.

### 5. Configure Your Project
Add the trigger URL to your `.env` (or `.env.local`) file:

```env
SIMPLEBACKUPS_TRIGGER_URL=https://simplebackups.com/api/webhook/trigger/YOUR_ID_HERE
```

## Triggering a Backup via API

You can trigger a backup programmatically by making a POST request to `/api/backup`.
This endpoint is protected and requires the user to be a logged-in Moderator.

```typescript
// Example frontend usage
await fetch('/api/backup', { method: 'POST' });
```
