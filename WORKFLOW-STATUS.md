# Minecraft Server Workflow Status

## ✅ ACTIVE WORKFLOWS

### **Main Server: `mc-server-24-7-fixed.yml`**
- ✅ **Status**: ACTIVE - Main server instance
- ✅ **Schedule**: Every 6 hours + manual dispatch
- ✅ **Features**: 
  - Auto-restart every 6 hours
  - World restore from repository
  - Complete plugin copying
  - Repository backups every 50 minutes
  - 6-hour timeout handling

## ❌ DISABLED WORKFLOWS

### **Auto-Restart: `auto-restart.yml`**
- ❌ **Status**: DISABLED - Would conflict with main server
- ❌ **Reason**: Would create second server instance
- ❌ **Conflict**: Port 25565, data corruption risk

### **Server Management: `restart-services.yml`**
- ❌ **Status**: DISABLED - Manual restart only
- ❌ **Reason**: Would create conflicting server instance
- ❌ **Available**: Status check only (restart disabled)

## 🔄 SERVER MANAGEMENT

### **How to Restart Server:**
1. **Wait for auto-restart** - Main workflow restarts every 6 hours
2. **Manual restart** - Use "Run workflow" on main workflow
3. **Status check** - Use restart-services workflow (status option only)

### **⚠️ WHY DISABLED:**

#### **Multiple Server Conflicts:**
```
mc-server-24-7-fixed.yml  → Server Instance 1 (Port 25565)
auto-restart.yml          → Server Instance 2 (Port 25565) ❌ CONFLICT!
restart-services.yml       → Server Instance 3 (Port 25565) ❌ CONFLICT!
```

#### **Data Corruption Risks:**
- Multiple servers writing to same `minecraft-data/`
- Race conditions on world saves
- Plugin configuration conflicts
- Player data corruption

### **🎯 RECOMMENDED SETUP:**

✅ **Use only**: `mc-server-24-7-fixed.yml`
✅ **Auto-restart**: Built into main workflow
✅ **Manual control**: Use main workflow's "Run workflow"
✅ **Status checks**: Use restart-services (status only)

## 📋 CURRENT SERVER FLOW

```
Start → Main workflow runs 6 hours
 ↓
Auto-restart → New instance starts (seamless)
 ↓
Repository backup → Every 50 minutes + daily
 ↓
World restore → From repository if needed
 ↓
Plugins → Complete directory copied
 ↓
Loop → Repeat every 6 hours
```

## 🔧 IF YOU NEED SEPARATE CONTROL

To enable manual restarts safely:

1. **Disable main workflow schedule**
2. **Enable restart-services.yml restart option**
3. **Ensure only one workflow runs at a time**

**Current recommendation**: Keep main workflow active, others disabled.
