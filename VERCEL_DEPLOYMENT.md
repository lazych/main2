# Vercel Deployment Guide

This project is ready to be deployed to Vercel. Because it uses Prisma with a PostgreSQL database, you need to ensure the database is accessible from Vercel's serverless environment.

## Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to GitHub.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **External PostgreSQL Database**: You need a hosted PostgreSQL database. Good options include:
    *   [Neon](https://neon.tech) (Serverless Postgres, very easy to set up)
    *   [Supabase](https://supabase.com)
    *   [Railway](https://railway.app)
    *   [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Managed by Vercel)

## Deployment Steps

1.  **Import Project to Vercel**:
    *   Go to your Vercel dashboard.
    *   Click "Add New..." -> "Project".
    *   Select your GitHub repository `cryllixv2` (or whatever you named it).
    *   Click "Import".

2.  **Configure Environment Variables**:
    *   In the "Configure Project" screen, look for the **Environment Variables** section.
    *   You MUST add the `DATABASE_URL` variable.
    *   **Name**: `DATABASE_URL`
    *   **Value**: The connection string from your database provider (e.g., `postgres://user:password@host:port/database?sslmode=require`).

    > **Important**: If you are using a connection pooler (like Supabase Transaction Mode or Neon Pooling), make sure to use the *pooled* connection string for `DATABASE_URL`. If your provider gives you a separate "Direct" URL (for migrations), you can add that as `DIRECT_URL` and update your `schema.prisma` to use it, but for a simple setup, the standard connection string usually works for both if not under heavy load.

    *   You MUST add the `JWT_SECRET` variable.
    *   **Name**: `JWT_SECRET`
    *   **Value**: A long, random string (e.g., generated via `openssl rand -base64 32`). This is used to sign session tokens.

3.  **Deploy**:
    *   Click "Deploy".
    *   Vercel will build your project. It will automatically run `prisma generate` because it's in your `postinstall` script in `package.json`.

4.  **Database Migrations (Production)**:
    *   After deployment, your database might be empty. You need to push your schema to the production database.
    *   You can do this from your *local* machine if you update your local `.env` file to point to the *production* database temporarily, or (better) use the Vercel CLI.
    *   **Easiest way**:
        1.  Get your production `DATABASE_URL`.
        2.  Run this command locally:
            ```bash
            DATABASE_URL="your_production_connection_string" npx prisma db push
            ```
        3.  This syncs the schema to your remote DB without needing to change your local `.env` file permanently.

## Troubleshooting

*   **"Prisma Client could not be initialized"**: This usually means `prisma generate` didn't run. Check the Build Logs in Vercel to ensure `postinstall` executed.
*   **Connection Errors**: Double-check your `DATABASE_URL`. Ensure your database allows connections from anywhere (0.0.0.0/0) or whitelists Vercel's IP ranges (allowing all is easier for serverless).
