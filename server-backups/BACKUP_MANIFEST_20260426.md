# Server Backup Manifest

**Date:** Sun Apr 26 04:21:28 UTC 2026
**Workflow Run:** 24948111883

## Backup Contents

### Worlds
- world-20260426.tar.gz - Main world data
- world_nether-20260426.tar.gz - Nether dimension
- world_the_end-20260426.tar.gz - End dimension

### Configurations
- server.properties - Server settings
- eula.txt - License agreement
- ops.json - Server operators
- whitelist.json - Player whitelist
- banned-players.json - Banned players
- banned-ips.json - Banned IPs

### Player Data
- playerdata-20260426.tar.gz - Player inventories and data
- stats-20260426.tar.gz - Player statistics
- advancements-20260426.tar.gz - Player achievements

### Plugins
- *.jar files - Plugin binaries
- plugin-configs-20260426.tar.gz - Plugin configurations

### Logs
- Recent server logs (last 7 days)

## Restoration Instructions

To restore from this backup:
1. Download the backup files from this repository
2. Extract the tar.gz files to appropriate directories
3. Place config files in server root
4. Restart the server

**Note:** This backup complements the GitHub Actions cache system.
