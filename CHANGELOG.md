# Cryllix v2 - Update Changelog

## ✨ New Features

### 🏆 Badge System
- **Profile Badges**: Users can now display badges on their profiles (e.g., "Early Adopter", "YouTuber", "Community MVP").
- **Badge Management**: New admin tools allow Moderators to manually assign or revoke badges from users directly in the dashboard.
- **Tooltip Details**: Hovering over badges displays their name and description.

### 🎨 Theming & Customization
- **New Themes**: Added **"Deep Ocean"** and **"Enchanted Forest"** themes.
- **Exclusive Content**: Added the **"NateDaPlayerYT"** theme with a unique background watermark.
- **Dual-Tone Icons**: New sidebar setting to toggle between solid and dual-tone icon styles.

### 🛠️ Admin & Moderator Tools
- **Password Reset**: Admins can now directly reset user passwords from the Moderator Dashboard.
- **User Management**: Streamlined user cards with integrated badge and password controls.

### ⚙️ Settings & Streamer Mode
- **Dedicated Settings Page**: specialized area for configuring app behavior.
- **Streamer Mode**: One-click toggle to censorship sensitive information (Game names, Place IDs, and Thumbnails) for safer broadcasting.

## 🔧 Improvements & Fixes

### 🎮 Game Icons & Data
- **Robust Thumbnail Proxy**: Implemented a secure Server-Side Proxy to fetch game icons directly from Roblox's `v1/places/gameicons` endpoint.
- **CORS Resolution**: Solved browser blocking issues by routing image requests through the server.
- **Performance**: Added 1-hour smart caching to icon requests to minimize server load and improve loading speeds.

### 🖥️ UI/UX Refinements
- **Sidebar Ergonomics**: Relocated the **Settings** icon to the bottom utility group for better accessibility.
- **Deno Proxy**: Offloaded all game icon traffic to a Deno Edge Worker (`fat-crab-33`) to eliminate Vercel costs and bypass CORS.
- **Reload Data**: Added a button to the Games page to refresh the list without reloading the page.
- **Navigation Cleanup**: Fixed an issue causing duplicate icons to appear in the navigation bar.
- **Visual Polish**: specific active states and hover effects for the sidebar dock.

### 🐛 Technical Fixes
- **Build Configuration**: Fixed `cf-workers-api` conflicts in `tsconfig.json` ensuring successful builds.
- **Type Safety**: Resolved various TypeScript errors in the Admin actions and Moderator dashboard.
