# Minecraft Server 24/7 with CraftIP

This repository contains GitHub Actions workflows to run a Minecraft server 24/7 with CraftIP tunneling for external access.

## Architecture

The setup consists of:
- **Minecraft Server**: Vanilla Minecraft server running in Docker container
- **CraftIP Client**: Rust-based tunneling client that forwards external connections to the local Minecraft server

## Setup Instructions

### 1. Repository Secrets

Add the following secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Your server's IP address or hostname |
| `SERVER_USER` | SSH username for server access |
| `SERVER_SSH_KEY` | Private SSH key for server access |
| `CRAFTIP_SERVER` | CraftIP server address (e.g., `tunnel.craftip.com`) |
| `CRAFTIP_PORT` | CraftIP server port (e.g., `25565`) |

### 2. Server Requirements

Your server needs:
- Docker and Docker Compose installed
- SSH access with key-based authentication
- Ports 25565 (Minecraft) and required CraftIP ports open

### 3. Workflow Usage

#### Main Deployment Workflow
- **Trigger**: Push to main/master branch, manual dispatch, or daily schedule
- **Action**: Builds and deploys both Minecraft server and CraftIP client
- **File**: `.github/workflows/mc-server-24-7.yml`

#### Service Management Workflow
- **Trigger**: Manual dispatch only
- **Actions**: Restart, stop, start, or check status of services
- **File**: `.github/workflows/restart-services.yml`

## How It Works

### Startup Sequence
1. **Minecraft Server** starts first on port 25565
2. **Health Check**: Waits until Minecraft server is healthy (accepting connections)
3. **CraftIP Client** starts after Minecraft is ready
4. **Port Forwarding**: CraftIP client connects to CraftIP server and forwards traffic

### Docker Compose Configuration
The services are configured with proper dependencies:
```yaml
craftip-client:
  depends_on:
    minecraft:
      condition: service_healthy
```

This ensures CraftIP only starts after Minecraft server is fully operational.

### Monitoring
The workflow includes monitoring scripts that:
- Check service status
- Display recent logs
- Verify port availability
- Restart failed services automatically

## Accessing Your Server

1. **Direct Connection**: Connect to `your-server-ip:25565`
2. **Via CraftIP**: Connect using the CraftIP tunnel address provided by your CraftIP service

## Troubleshooting

### Common Issues

**CraftIP client fails to start:**
- Check if Minecraft server is healthy: `docker-compose logs minecraft`
- Verify CraftIP server credentials in repository secrets
- Ensure CraftIP server is accessible from your server

**Minecraft server not starting:**
- Check EULA acceptance in docker-compose.yml
- Verify sufficient disk space and memory
- Review Minecraft server logs: `docker-compose logs minecraft`

**Port conflicts:**
- Ensure port 25565 is not in use by other services
- Check firewall settings on your server

### Manual Commands
SSH into your server and run:
```bash
cd ~/mc-server-deployment

# Check status
./monitor-services.sh

# Restart services
./start-services.sh

# View logs
docker-compose logs -f minecraft
docker-compose logs -f craftip-client
```

## Customization

### Minecraft Server Settings
Edit the `minecraft` service in docker-compose.yml to customize:
- Server type (VANILLA, SPIGOT, PAPER, etc.)
- Server version
- Difficulty, game mode, and other server properties
- Resource packs and mods

### CraftIP Configuration
Modify the CraftIP client command to use different:
- Minecraft server address
- CraftIP server endpoints
- Additional forwarding rules

## Security Notes

- Use SSH key authentication, not passwords
- Regularly update Docker images
- Monitor logs for suspicious activity
- Consider using a VPN for additional security
- Keep your CraftIP credentials secure

## Maintenance

The workflows include:
- **Daily health checks**: Automatic restart if services fail
- **Image updates**: Pull latest Docker images on deployment
- **Log rotation**: Configure Docker logging to prevent disk fill

## Support

For issues with:
- **GitHub Actions**: Check the Actions tab in your repository
- **Minecraft Server**: Review official Minecraft documentation
- **CraftIP**: Check the CraftIP project documentation in the `craftip/` directory
