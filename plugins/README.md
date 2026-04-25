# Minecraft Server Plugins

Place your Minecraft server plugins (.jar files) in this directory.

## How it works:

1. **Repository Plugins**: Any .jar files placed here will be automatically copied to the server's plugins directory when the workflow starts
2. **Automatic Preservation**: Plugins are preserved in the GitHub Actions cache and will survive server restarts
3. **Dynamic Loading**: Plugins are copied before the server starts, ensuring they're loaded properly

## Adding Plugins:

1. Download plugin .jar files from trusted sources (SpigotMC, BukkitDev, etc.)
2. Place them in this directory
3. Commit the changes to your repository
4. The workflow will automatically deploy them

## Important Notes:

- Only use plugins compatible with your Minecraft server version
- Some plugins may require additional configuration files
- Large plugin files may increase repository size
- Always verify plugin sources for security

## Example Structure:

```
plugins/
├── README.md
├── EssentialsX-2.19.4.jar
├── WorldEdit-7.2.10.jar
└── LuckPerms-5.4.72.jar
```
