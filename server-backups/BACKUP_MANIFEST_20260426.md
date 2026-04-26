# Repository Backup Manifest

**Date:** Sun Apr 26 05:16:36 UTC 2026
**Workflow Run:** 24948983844

## IMPORTANT: READ ONLY BACKUP

This workflow does NOT access server files to prevent interference.
All server backups are handled by the main workflow.

## What This Workflow Does:
- ✅ Commits existing repository files
- ✅ Cleans up old repository files
- ❌ Does NOT access server cache
- ❌ Does NOT start any servers
- ❌ Does NOT copy server files

## Real Server Backups:
Server backups are created by: `mc-server-24-7-fixed.yml`
- Every 50 minutes (quick backups)
- Every 12 hours (full backups)
- Stored in GitHub Actions cache

## Repository Files:
- `server-backups/` - Committed by main workflow
- `plugins/` - Plugin JARs and configs
- `README-MC-Server.md` - Documentation

**Note:** This is a READ-ONLY repository operation workflow.
