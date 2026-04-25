# License Key API Documentation

This API provides endpoints for generating and validating license keys for your Cryllix dashboard.

## Endpoints

### 1. Generate License Key

**POST** `/api/license/generate`

Generates a new cryptographically secure license key and stores it in the database.

#### Request Body

```json
{
  "prefix": "CRYL",           // Optional: Prefix for the key (default: "CRYL")
  "segments": 4,              // Optional: Number of segments (default: 4)
  "segmentLength": 4,         // Optional: Length of each segment (default: 4)
  "separator": "-",           // Optional: Separator character (default: "-")
  "expiresInDays": 30,        // Optional: Number of days until expiration
  "maxUses": 1,               // Optional: Maximum number of uses (default: 1)
  "metadata": {               // Optional: Custom metadata as JSON
    "plan": "premium",
    "features": ["feature1", "feature2"]
  }
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "license": {
    "key": "CRYL-A4B2-C9D1-E7F3-G8H6",
    "expiresAt": "2025-12-22T05:53:35.329Z",
    "maxUses": 1,
    "createdAt": "2025-11-22T05:53:35.329Z"
  }
}
```

#### Example Usage

```javascript
// Generate a simple key
const response = await fetch('/api/license/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
});

// Generate a custom key with expiration
const response = await fetch('/api/license/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prefix: 'PREMIUM',
    segments: 5,
    expiresInDays: 365,
    maxUses: 10,
    metadata: {
      tier: 'gold',
      userId: 'user-123'
    }
  })
});
```

---

### 2. Validate License Key

**POST** `/api/license/validate`

Validates a license key and increments its usage count if valid.

#### Request Body

```json
{
  "key": "CRYL-A4B2-C9D1-E7F3-G8H6"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "valid": true,
  "license": {
    "key": "CRYL-A4B2-C9D1-E7F3-G8H6",
    "usedCount": 1,
    "maxUses": 1,
    "expiresAt": "2025-12-22T05:53:35.329Z"
  }
}
```

#### Error Responses

**Invalid key (404)**
```json
{
  "success": false,
  "valid": false,
  "error": "Invalid license key"
}
```

**Expired key (403)**
```json
{
  "success": false,
  "valid": false,
  "error": "License key has expired"
}
```

**Max uses reached (403)**
```json
{
  "success": false,
  "valid": false,
  "error": "License key has reached maximum usage limit"
}
```

**Deactivated key (403)**
```json
{
  "success": false,
  "valid": false,
  "error": "License key has been deactivated"
}
```

#### Example Usage

```javascript
const response = await fetch('/api/license/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'CRYL-A4B2-C9D1-E7F3-G8H6'
  })
});

const result = await response.json();
if (result.valid) {
  // License is valid, proceed with registration
  console.log('License validated!');
} else {
  // Show error to user
  console.error(result.error);
}
```

---

## Security Features

✅ **Cryptographically secure random generation** using Node.js `crypto` module  
✅ **Database persistence** with Prisma ORM  
✅ **Usage tracking** to prevent key reuse  
✅ **Expiration dates** for time-limited licenses  
✅ **Active/inactive status** for manual deactivation  
✅ **Flexible metadata** for storing custom data  

---

## Database Schema

The `LicenseKey` table includes:

```prisma
model LicenseKey {
  id         String    @id @default(cuid())
  key        String    @unique
  isUsed     Boolean   @default(false)
  maxUses    Int       @default(1)
  usedCount  Int       @default(0)
  isActive   Boolean   @default(true)
  expiresAt  DateTime?
  lastUsedAt DateTime?
  metadata   Json      @default("{}")
  userId     String?   @unique
  user       User?     @relation(fields: [userId], references: [id])
  createdAt  DateTime  @default(now())
}
```

---

## Common Use Cases

### 1. Single-use invite keys
```javascript
await fetch('/api/license/generate', {
  method: 'POST',
  body: JSON.stringify({ maxUses: 1 })
});
```

### 2. Multi-use beta keys
```javascript
await fetch('/api/license/generate', {
  method: 'POST',
  body: JSON.stringify({
    prefix: 'BETA',
    maxUses: 100,
    expiresInDays: 30
  })
});
```

### 3. Premium lifetime keys
```javascript
await fetch('/api/license/generate', {
  method: 'POST',
  body: JSON.stringify({
    prefix: 'PREMIUM',
    maxUses: 1,
    metadata: { tier: 'lifetime', features: ['all'] }
  })
});
```

---

## Testing with cURL

```bash
# Generate a key
curl -X POST http://localhost:3000/api/license/generate \
  -H "Content-Type: application/json" \
  -d '{}'

# Validate a key
curl -X POST http://localhost:3000/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{"key":"CRYL-A4B2-C9D1-E7F3-G8H6"}'
```
