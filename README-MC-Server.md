# Minecraft Server 24/7 with CraftIP

This repository contains GitHub Actions workflows to run a Minecraft server 24/7 entirely within GitHub Actions infrastructure, with CraftIP tunneling for external access.

## Architecture

The setup consists of:
- **Minecraft Server**: Vanilla Minecraft server running on GitHub Actions runners
- **CraftIP Client**: Rust-based tunneling client that forwards external connections to the local Minecraft server
- **GitHub Actions**: Provides the hosting infrastructure with persistent caching

## Setup Instructions

### 1. Repository Requirements

No external server needed! Everything runs on GitHub Actions:
- GitHub repository with Actions enabled
- Sufficient repository storage for world data
- No additional secrets required for basic setup

### 2. Workflow Usage

#### Main Server Workflow
- **Trigger**: Push to main/master branch, manual dispatch, or every 6 hours
- **Action**: Starts and maintains Minecraft server with CraftIP client
- **File**: `.github/workflows/mc-server-24-7.yml`
- **Timeout**: 9999 minutes (keeps running continuously)

#### Server Management Workflow
- **Trigger**: Manual dispatch only
- **Actions**: Restart or check status of services
- **File**: `.github/workflows/restart-services.yml`

## How It Works

### Startup Sequence
1. **GitHub Actions Runner** starts on Ubuntu latest
2. **Minecraft Server** starts first on port 25565
3. **Port Check**: Waits until Minecraft server is listening on port 25565
4. **CraftIP Client** starts after Minecraft is ready
5. **Port Forwarding**: CraftIP client connects to CraftIP server and forwards traffic

### Persistent Storage
- Uses GitHub Actions cache to store world data between runs
- Cache key: `mc-server-${{ github.run_id }}`
- Restores from previous runs using `mc-server-` prefix

### Monitoring Loop
The workflow includes a monitoring loop that:
- Checks if both services are still running every 30 seconds
- Automatically restarts any crashed service
- Shows status every 10 minutes
- Maintains the server 24/7

## Accessing Your Server

1. **Via CraftIP**: Connect using the CraftIP tunnel address
2. **Direct Connection**: Not available (GitHub Actions runners don't have public IPs)

## Important Limitations

### GitHub Actions Constraints
- **No Public IP**: Cannot directly connect to the server without CraftIP
- **Timeout Limits**: Jobs timeout at 9999 minutes (~7 days)
- **Resource Limits**: 2-core CPU, 7GB RAM, 14GB storage
- **Billing**: Uses repository Actions minutes

### Data Persistence
- World data persists through GitHub Actions cache
- Cache may be cleared after long periods of inactivity
- Consider backing up important world data

## Workflow Controls

### Starting the Server
1. Go to Actions tab in your repository
2. Select "Minecraft Server 24/7 with CraftIP" workflow
3. Click "Run workflow"

### Managing the Server
1. Go to Actions tab
2. Select "MC Server Management" workflow
3. Choose action: "restart" or "status"
4. Click "Run workflow"

### Viewing Logs
1. Go to Actions tab
2. Click on the running workflow
3. View real-time logs in the workflow run

## Troubleshooting

### Common Issues

**Workflow stops unexpectedly:**
- Check if GitHub Actions minutes are exhausted
- Verify workflow hasn't hit the 9999 minute timeout
- Check workflow logs for error messages

**CraftIP client fails to start:**
- Verify Minecraft server is listening on port 25565
- Check CraftIP client compilation in the logs
- Ensure CraftIP server is accessible

**Minecraft server not starting:**
- Check if EULA was accepted (automated in workflow)
- Verify sufficient memory allocation (2GB max, 1GB min)
- Review Minecraft server logs in workflow output

**Cache not restoring:**
- Cache may expire after 7 days of inactivity
- Consider manual backup of important world data
- Check cache size limits (up to 5GB per repository)

### Manual Intervention
If the workflow crashes:
1. Use the "MC Server Management" workflow to restart
2. Check the workflow logs for specific error messages
3. Cancel and restart the main workflow if needed

## Customization

### Minecraft Server Settings
Edit the server properties in the workflow:
```yaml
motd=GitHub Actions Minecraft Server
difficulty=normal
gamemode=survival
spawn-protection=0
online-mode=false
pvp=true
```

### Resource Allocation
Modify Java memory settings:
```bash
java -Xmx2G -Xms1G -jar server.jar nogui
```

### CraftIP Configuration
The CraftIP client connects to `localhost:25565` by default. Modify in:
```bash
./target/release/client localhost:25565
```

## Cost Considerations

### GitHub Actions Usage
- **Free Tier**: 2000 minutes/month for public repositories
- **Pro Tier**: 3000 minutes/month for private repositories
- **Usage**: ~4320 minutes/month for 24/7 operation (3 days per run)
- **Cost**: May exceed free tier limits

### Optimization Tips
- Use the schedule trigger instead of continuous running
- Consider running only during active hours
- Monitor usage in repository settings

## Security Notes

- World data is stored in GitHub Actions cache
- No sensitive secrets required for basic operation
- CraftIP credentials should be kept secure if used
- Regular monitoring recommended

## Maintenance

The workflows include:
- **Automatic restarts**: Services restart if they crash
- **Status monitoring**: Regular health checks
- **Cache management**: Automatic cache restoration
- **Scheduled restarts**: Every 6 hours to ensure freshness

## Support

For issues with:
- **GitHub Actions**: Check repository Actions tab and billing
- **Minecraft Server**: Review workflow logs and server properties
- **CraftIP**: Check the CraftIP project documentation in the `craftip/` directory

## Alternative Approaches

If GitHub Actions limitations are restrictive:
- Consider cloud hosting providers (AWS, Google Cloud, Azure)
- Use dedicated game server hosting services
- Set up a home server with port forwarding
