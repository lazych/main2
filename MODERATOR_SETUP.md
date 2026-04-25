# Moderator Dashboard Setup Guide

## What I've Created

A complete moderator dashboard where you can view all users and ban/unban them using a hammer icon.

## Features

### Moderator Panel (`/dashboard/moderator`)
- **Stats Dashboard**: Shows total users, banned users, and moderator count
- **User List**: Displays all registered users with their details
- **Ban/Unban Actions**: Hammer icon for banning, shield icon for unbanning
- **Visual Indicators**: Color-coded badges for moderators and banned users
- **Confirmation Dialogs**: Prevents accidental bans/unbans

### Database Changes
- Added `isModerator` field to User model (default: false)
- Added `isBanned` field to User model (default: false)

### Security
- Only moderators can access `/dashboard/moderator`
- Non-moderators are redirected to main dashboard
- Moderators cannot ban other moderators

## Setup Instructions

1. **Update Database Schema**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Create a Moderator Account**:
   You'll need to manually set a user as moderator in the database:
   ```sql
   UPDATE "User" SET "isModerator" = true WHERE username = 'your_username';
   ```

3. **Access the Panel**:
   - Log in with your moderator account
   - Click the hammer icon in the sidebar
   - You'll see all users and can ban/unban them

## Usage

- **Ban a User**: Click the red "Ban User" button with hammer icon
- **Unban a User**: Click the green "Unban User" button with shield icon
- **View Stats**: See total users, banned count, and moderator count at the top

Banned users will be automatically redirected to `/banned` when they try to access the dashboard.
