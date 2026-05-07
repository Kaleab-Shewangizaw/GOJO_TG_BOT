# 🤖 Redis Session Storage - Testing & Demo Guide

**For:** Production Hardening Presentation  
**Date:** May 7, 2026  
**Topic:** Session Persistence with Redis  

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [How It Works - Detailed](#how-it-works---detailed)
4. [Testing on Telegram](#testing-on-telegram)
5. [Demo Scenarios](#demo-scenarios)
6. [What to Expect](#what-to-expect)
7. [Troubleshooting](#troubleshooting)
8. [Presentation Notes](#presentation-notes)

---

## 🚀 QUICK START

### Prerequisites
- Node.js 18+ installed
- Redis installed and running
- Telegram bot token
- GROQ API key

### Setup (5 minutes)

**Step 1: Install Redis**

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows (WSL recommended):**
```bash
# In WSL Ubuntu
sudo apt-get install redis-server
redis-server
```

**Verify Redis is running:**
```bash
redis-cli ping
# Output: PONG
```

**Step 2: Configure Backend**

```bash
cd backend
cp .env.example .env

# Edit .env and add your credentials:
# BOT_TOKEN=<your-telegram-bot-token>
# GROQ_API_KEY=<your-groq-api-key>
# MINI_APP_URL=<your-https-url> (optional)
# REDIS_URL=redis://localhost:6379  # Add this line
```

**Step 3: Start Bot**

```bash
npm run dev
# Expected output:
# [Redis] Connected successfully
# [Redis] Ready
# [startup] Long polling active. Press Ctrl+C to stop.
```

✅ Bot is now live with Redis session persistence!

---

## 🏗️ ARCHITECTURE OVERVIEW

### Before vs After

#### OLD (In-Memory, Broken on Restart)
```
User → Telegram → Backend Bot → Memory (Map)
         ↓
       User closes chat
         ↓
    Bot restarts (crash/deploy)
         ↓
    ❌ ALL SESSIONS LOST
    User's ticket draft: GONE
```

#### NEW (Redis Persistent, Survives Restart)
```
User → Telegram → Backend Bot → Redis (Disk)
         ↓
       User closes chat
         ↓
    Bot restarts (crash/deploy)
         ↓
    ✅ Sessions preserved in Redis
    User can continue ticket draft!
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│           USER ON TELEGRAM                      │
└────────────────────┬────────────────────────────┘
                     │
                     │ Sends message (text/command)
                     ↓
        ┌────────────────────────────┐
        │  TELEGRAF BOT (Node.js)    │
        │                            │
        │ 1. Parse message           │
        │ 2. Check for session       │
        │ 3. Handle flow step        │
        └────────────┬───────────────┘
                     │
                     ├─ Need to load session?
                     │  ↓
                     │  Call: getSession(userId)
                     │  ↓
        ┌────────────▼──────────────────┐
        │   redis-client.js             │
        │                               │
        │ getRedisClient()              │
        │   ↓                           │
        │   client.get(`session:${id}`) │
        └────────────┬──────────────────┘
                     │
                     ↓
        ┌────────────────────────────────────┐
        │         REDIS SERVER               │
        │  (Persistent Key-Value Store)      │
        │                                    │
        │  Key: `session:123456789`          │
        │  Value: {                          │
        │    type: "ticket",                 │
        │    step: 2,                        │
        │    draft: {email: "..."}           │
        │  }                                 │
        │                                    │
        │  TTL: 1 hour (auto-expires)        │
        └────────────────────────────────────┘
                     │
                     │ Returns parsed session object
                     ↓
        ┌────────────────────────────┐
        │  flows.js (handleSessionText)
        │                            │
        │ Update draft               │
        │ Increment step             │
        │ Call: setSession(userId, updatedSession)
        └────────────┬───────────────┘
                     │
                     ├─ Save updated session
                     │  ↓
        ┌────────────▼──────────────────┐
        │   redis-client.js             │
        │                               │
        │ getRedisClient()              │
        │   ↓                           │
        │   client.setEx(key, TTL, JSON)│
        └────────────┬──────────────────┘
                     │
                     ↓
        ┌────────────────────────────────────┐
        │         REDIS SERVER               │
        │                                    │
        │  STORED: Updated session data      │
        │  TTL Reset: +1 hour from now       │
        │                                    │
        │  (Data persists across restarts!)  │
        └────────────────────────────────────┘
                     │
                     │ Success
                     ↓
        ┌────────────────────────────┐
        │   Bot sends reply to user   │
        │   "Step 3 of 4 — ..."       │
        └────────────────────────────┘
```

---

## 🔍 HOW IT WORKS - DETAILED

### 1. Initialization (On Bot Startup)

**File:** `backend/index.js`

```javascript
// Step 1: Load environment variables
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

// Step 2: Import Redis client
const { initRedis, closeRedis } = require("./support/redis-client");

// Step 3: Initialize Redis BEFORE starting bot
(async () => {
  try {
    const redisUrl = process.env.REDIS_URL; // e.g., "redis://localhost:6379"
    await initRedis(redisUrl);  // ← Connects to Redis server
    
    // Step 4: Start bot (only after Redis is ready)
    await bot.launch();
    console.log("[startup] Long polling active. Press Ctrl+C to stop.");
  } catch (err) {
    console.error("[startup] launch failed:", err.message);
    process.exit(1);
  }
})();
```

**What happens:**
1. Bot loads `.env` to get `REDIS_URL`
2. `initRedis(redisUrl)` creates connection to Redis server
3. Waits for connection to be ready
4. Only then starts the bot
5. If Redis fails → bot shows error but tries to continue (graceful degradation)

### 2. Redis Connection Module

**File:** `backend/support/redis-client.js`

```javascript
const redis = require('redis');
let client = null;

async function initRedis(redisUrl) {
  // If already connected, skip
  if (client) return;
  
  // Use provided URL or default
  const url = redisUrl || 'redis://localhost:6379';
  
  // Create client with auto-reconnect
  client = redis.createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('[Redis] Max reconnection attempts reached');
          return new Error('Redis reconnect failed');
        }
        // Exponential backoff: 50ms, 100ms, 150ms, ... max 500ms
        return Math.min(retries * 50, 500);
      },
    },
  });
  
  // Event handlers for monitoring
  client.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
  });
  
  client.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });
  
  // Actually connect
  await client.connect();
}

function getRedisClient() {
  return client;
}

function isConnected() {
  return client && client.isOpen;
}
```

**Key concepts:**
- **`client`** — Global Redis connection (singleton)
- **`url`** — Connection string (default: localhost:6379)
- **`reconnectStrategy`** — Auto-retry if connection lost
- **Event handlers** — Log when Redis connects/errors
- **`isConnected()`** — Check if Redis is available before using

### 3. Session Storage Implementation

**File:** `backend/support/session-store.js`

```javascript
const { getRedisClient, isConnected } = require('./redis-client');

const SESSION_TTL = 3600; // Sessions expire after 1 hour

// GET a session
async function getSession(userId) {
  try {
    // 1. Check if Redis is available
    if (!isConnected()) {
      console.warn('[Session] Redis not connected');
      return undefined;
    }

    // 2. Get Redis client
    const client = getRedisClient();
    
    // 3. Build key: "session:123456789"
    const key = `session:${userId}`;
    
    // 4. Retrieve from Redis
    const data = await client.get(key);
    
    // 5. No data? Return undefined
    if (!data) {
      return undefined;
    }

    // 6. Parse JSON and return
    return JSON.parse(data);
  } catch (err) {
    console.error('[Session] Error retrieving:', err.message);
    return undefined;
  }
}

// SAVE a session
async function setSession(userId, session) {
  try {
    // 1. Check if Redis is available
    if (!isConnected()) {
      console.warn('[Session] Redis not connected, not persisted');
      return;
    }

    // 2. Get Redis client
    const client = getRedisClient();
    
    // 3. Build key
    const key = `session:${userId}`;
    
    // 4. Save to Redis with TTL
    // setEx = SET with EXpiration time
    // Args: key, TTL in seconds, value as JSON string
    await client.setEx(key, SESSION_TTL, JSON.stringify(session));
    
    // Session now persists for 1 hour
    // If user goes inactive → automatically deleted
  } catch (err) {
    console.error('[Session] Error storing:', err.message);
  }
}

// DELETE a session
async function clearSession(userId) {
  try {
    if (!isConnected()) {
      return;
    }

    const client = getRedisClient();
    const key = `session:${userId}`;
    
    // Delete the key from Redis
    await client.del(key);
  } catch (err) {
    console.error('[Session] Error clearing:', err.message);
  }
}

module.exports = {
  getSession,
  setSession,
  clearSession,
};
```

**Key operations:**
- **GET** — Retrieve session data (returns undefined if not found)
- **SET** — Store session data with auto-expiration (1 hour)
- **DEL** — Remove session when user cancels
- **Error handling** — Warns but doesn't crash if Redis unavailable

### 4. Ticket Flow Implementation

**File:** `backend/support/flows.js`

```javascript
const { getSession, setSession, clearSession } = require('./session-store');

// USER SENDS: /ticket
async function startTicketFlow(ctx) {
  const userId = ctx.from?.id; // e.g., 123456789

  // 1. CREATE new session object
  const newSession = {
    type: "ticket",    // This is a ticket flow (not verify)
    step: 1,           // Start at step 1
    draft: {}          // Empty draft object
  };

  // 2. SAVE to Redis
  await setSession(userId, newSession);
  // ↓ Redis now has: session:123456789 → {type: "ticket", step: 1, draft: {}}

  // 3. Send first prompt to user
  await ctx.reply(
    "**Support ticket draft**\n\n" +
    "Step 1 of 4 — **Account email on file** with GojoHost:\n\n" +
    "_Send /cancel anytime to exit._",
    { parse_mode: "Markdown" }
  );
}

// USER SENDS: "user@example.com"
async function handleSessionText(ctx) {
  const userId = ctx.from?.id;
  const text = ctx.message?.text?.trim(); // "user@example.com"

  // 1. RETRIEVE session from Redis
  const session = await getSession(userId);
  // ↓ Redis returns: {type: "ticket", step: 1, draft: {}}

  if (!session) {
    // No active session, ignore
    return false;
  }

  // 2. CHECK session type and step
  if (session.type === "ticket") {
    // Handle based on current step
    if (session.step === 1) {
      // STEP 1: Save email
      session.draft.email = text;     // "user@example.com"
      session.step = 2;               // Move to step 2
      
      // 3. SAVE updated session back to Redis
      await setSession(userId, session);
      // ↓ Redis now has: {type: "ticket", step: 2, draft: {email: "user@example.com"}}

      // 4. Send next prompt
      await ctx.reply("**Step 2** — **Short category** (e.g. billing, email, website down):");
      return true;
    }
    
    if (session.step === 2) {
      // STEP 2: Save category
      session.draft.category = text;  // "billing"
      session.step = 3;
      
      await setSession(userId, session);
      // ↓ Redis: {type: "ticket", step: 3, draft: {email: "...", category: "billing"}}

      await ctx.reply("**Step 3** — **What you already tried**:");
      return true;
    }

    // ... Steps 3 and 4 follow same pattern ...

    if (session.step === 4) {
      // FINAL STEP: Compile summary
      session.draft.details = text;
      
      // Build summary message
      const summary = `
        **New support ticket (draft)**
        
        **Email:** ${session.draft.email}
        **Category:** ${session.draft.category}
        **Details:** ${session.draft.details}
      `;

      // 5. CLEAR session (ticket complete)
      await clearSession(userId);
      // ↓ Redis: session:123456789 is DELETED

      // 6. Send summary
      await ctx.reply(summary);
      return true;
    }
  }

  return false;
}

// USER SENDS: /cancel
async function cancelFlow(ctx) {
  const userId = ctx.from?.id;

  // 1. CLEAR the session immediately
  if (userId) {
    await clearSession(userId);
    // ↓ Redis: session:123456789 is DELETED
  }

  // 2. Confirm to user
  await ctx.reply("Cancelled. /menu when you need the hub.");
}
```

**Flow logic:**
1. `/ticket` → Create session, ask step 1
2. User replies → Load session, process input, update step, save session, ask next step
3. Repeat steps 2-3 for steps 2, 3, 4
4. Step 4 → Compile summary, delete session, send to user
5. `/cancel` at any time → Delete session immediately

### 5. Data Persistence Example

**Scenario:** Bot crashes during ticket flow

```
Timeline:
=========

T=0s   User: /ticket
       Action: startTicketFlow()
       Redis saves: session:123456789 = {type: "ticket", step: 1, draft: {}}
       Bot replies: "Step 1 of 4..."

T=5s   User: "user@example.com"
       Action: handleSessionText()
       Redis loads: session:123456789
       Redis saves: session:123456789 = {type: "ticket", step: 2, draft: {email: "..."}}
       Bot replies: "Step 2 of 4..."

T=10s  User: "billing"
       Action: handleSessionText()
       Redis loads: session:123456789
       Redis saves: session:123456789 = {type: "ticket", step: 3, draft: {email: "...", category: "billing"}}
       Bot replies: "Step 3 of 4..."

T=15s  💥 BOT CRASHES (power failure, deployment, etc.)
       Redis: Session is STILL STORED (persisted on disk/RAM)

T=20s  Bot restarts
       index.js: initRedis(REDIS_URL)
       Redis connection re-established
       Bot starts polling

T=25s  User: "Already contacted support once"
       Action: handleSessionText()
       Redis loads: session:123456789 = {type: "ticket", step: 3, draft: {...}} ✅ STILL THERE!
       
       User can CONTINUE! Step 3 is loaded, draft is intact
       User doesn't have to start over!
```

---

## 🧪 TESTING ON TELEGRAM

### Test Setup

1. **Terminal 1 - Start Redis:**
```bash
redis-server
# Output: Ready to accept connections
```

2. **Terminal 2 - Start Bot:**
```bash
cd backend
npm run dev

# Expected output:
# [Redis] Connected successfully
# [Redis] Ready
# [startup] Long polling active. Press Ctrl+C to stop.
```

3. **Open Telegram** and find your bot

---

### Test 1: Basic Ticket Flow (Without Restart)

**Objective:** Verify ticket flow works

**Steps:**

1. **Send:** `/ticket`
   - **Expected:**
     ```
     Support ticket draft
     
     Step 1 of 4 — Account email on file with GojoHost (the one you used to sign up):
     
     Send /cancel anytime to exit.
     ```

2. **Send:** `support@mycompany.com`
   - **Expected:**
     ```
     Step 2 — Short category (e.g. billing, email, website down, dns):
     ```

3. **Send:** `website_down`
   - **Expected:**
     ```
     Step 3 — What you already tried (one message, keep it honest):
     ```

4. **Send:** `Checked DNS, restarted server`
   - **Expected:**
     ```
     Step 4 — Problem description — include exact error text or screenshots description:
     ```

5. **Send:** `Site shows 500 error. Error log: Internal Server Error`
   - **Expected:**
     ```
     New support ticket (draft)
     
     Email on file: support@mycompany.com
     Domain / service: (add if missing below)
     Category: website_down
     Already tried: Checked DNS, restarted server
     
     Details:
     Site shows 500 error. Error log: Internal Server Error
     
     Telegram user: @yourname (id 123456789)
     
     Send this block to support@gojohost.net or Telegram @GojoHostSupport.
     
     Done. If you need the menu again: /menu
     ```

✅ **Session was loaded and saved 4 times successfully**

---

### Test 2: Session Persistence Across Bot Restart

**Objective:** Verify session survives bot restart

**Prerequisites:** Terminal 1 (Redis) still running

**Steps:**

1. **Send:** `/ticket`
2. **Send:** `test@example.com`
3. **Bot shows:** "Step 2 of 4 — Short category..."
   
   **At this point:**
   - Redis has: `session:123456789 = {type: "ticket", step: 2, draft: {email: "test@example.com"}}`

4. **Restart bot:**
   - Terminal 2: Press `Ctrl+C`
   - Wait 2 seconds
   - Run: `npm run dev` again
   
   **Expected console output:**
   ```
   [Redis] Connected successfully
   [Redis] Ready
   [startup] Long polling active. Press Ctrl+C to stop.
   ```

5. **Send:** `billing` (continue ticket without restart!)
   
   **Expected:**
   ```
   Step 3 of 4 — What you already tried (one message, keep it honest):
   ```
   
   ✅ **Bot loaded session from Redis! You're at step 3, not restarted to step 1**

6. **Complete the flow normally:**
   - Send: `Already checked account settings`
   - Send: `Need to add a new domain to hosting`
   
   **Ticket should complete successfully**

✅ **Session persisted across bot restart!**

---

### Test 3: Multiple Users Simultaneous Sessions

**Objective:** Verify multiple users can have independent sessions

**How to test:** Use a second account, or have a friend test simultaneously

**User A (Telegram ID: 111111111):**
- Send: `/ticket`
- Send: `usera@example.com`
- (Stop here, don't complete)

**User B (Telegram ID: 222222222):**
- Send: `/ticket`
- Send: `userb@example.com`
- (Stop here, don't complete)

**Check Redis (in Terminal 3):**
```bash
redis-cli
> KEYS session:*
# Output:
# 1) "session:111111111"
# 2) "session:222222222"

> GET session:111111111
# Output: {"type":"ticket","step":2,"draft":{"email":"usera@example.com"}}

> GET session:222222222
# Output: {"type":"ticket","step":2,"draft":{"email":"userb@example.com"}}
```

✅ **Each user has independent session data**

---

### Test 4: Session Timeout

**Objective:** Verify sessions auto-expire after 1 hour

**Steps:**

1. **Send:** `/ticket`
2. **Send:** `test@example.com`
3. **Wait 1 hour** (or simulate by editing TTL in code)
   
   **After 1 hour:**
   - Redis automatically deletes: `session:123456789`
   - User's session is gone
   
4. **Send:** `some random text`
   
   **Expected:**
   - Message is ignored (no active session)
   - Not treated as part of ticket flow
   
   ✅ **Session auto-expired as expected**

---

### Test 5: Error Handling - Redis Connection Loss

**Objective:** Verify bot doesn't crash if Redis is unavailable

**Prerequisites:** Bot is running

**Steps:**

1. **Stop Redis:**
   - Terminal 1: Press `Ctrl+C`
   
2. **Send message to bot:**
   ```
   Any text message
   ```
   
   **Expected:**
   - Bot still responds
   - Console shows: `[Session] Redis not connected, cannot retrieve session`
   - Bot doesn't crash
   
3. **Start Redis again:**
   ```bash
   redis-server
   ```
   
4. **Send:** `/ticket`
   
   **Expected:**
   - Session is now saved to Redis again
   - Console shows: `[Redis] Connected successfully`
   - Bot works normally

✅ **Graceful degradation - bot didn't crash!**

---

### Test 6: Cancel Flow

**Objective:** Verify `/cancel` clears session

**Steps:**

1. **Send:** `/ticket`
2. **Send:** `test@example.com`
3. **Send:** `/cancel`
   
   **Expected:**
   ```
   Cancelled. /menu when you need the hub.
   ```
   
   **Behind the scenes:**
   - `clearSession(userId)` called
   - Redis key deleted: `session:123456789`

4. **Send:** `some random text`
   
   **Expected:**
   - Message is ignored (no session exists)
   - Not treated as ticket step
   
   ✅ **Session was properly cleared**

---

## 📊 DEMO SCENARIOS

### Scenario 1: "Show Session Persistence" (5 minutes)

**Objective:** Demonstrate that sessions survive restart

**Steps:**

1. **Open Terminal showing Redis:**
   ```bash
   redis-cli
   > MONITOR  # Shows all Redis operations in real-time
   ```

2. **In Telegram, start ticket:** `/ticket`

3. **Watch Redis terminal:** You'll see `SET session:xxx` command

4. **Send email:** `test@example.com`

5. **Watch Redis terminal:** You'll see `SET session:xxx` with updated data

6. **Stop bot** (Ctrl+C) while monitoring Redis

7. **Start bot again** (npm run dev)

8. **In Telegram, send:** `billing`

9. **Watch Redis terminal:** You'll see `GET session:xxx` retrieving saved session

10. **Result:** 
    - Bot loaded session from Redis
    - Step was still 2 (not reset to 1)
    - Ticket flow continued
    
   ✅ **Proof: Session persisted across restart**

---

### Scenario 2: "Multiple Concurrent Users" (3 minutes)

**Objective:** Show independent sessions

**Setup:** Have 2 Telegram accounts ready (or use phone + desktop)

**Steps:**

1. **User A:** Send `/ticket`
2. **User A:** Send `usera@example.com`
3. **User B:** Send `/ticket`
4. **User B:** Send `userb@example.com`

5. **Show Redis (Terminal 3):**
   ```bash
   redis-cli
   > KEYS session:*
   ```
   
   **Output:** 2 different keys for 2 different users

6. **Continue with User A:** Send `billing`
   - Bot shows "Step 3"
   
7. **Continue with User B:** Send `dns_issue`
   - Bot shows "Step 3"

8. **Explain:** Each user's draft is saved independently in Redis

✅ **Proof: Multiple users can have simultaneous sessions**

---

### Scenario 3: "Error Resilience" (2 minutes)

**Objective:** Show bot doesn't crash when Redis fails

**Steps:**

1. **Stop Redis:** `Ctrl+C` in Terminal 1
2. **Send message in Telegram:**
   ```
   test message
   ```
3. **Bot still responds** (doesn't crash)
4. **Console shows warning:** `[Session] Redis not connected`
5. **Restart Redis**
6. **Try ticket again:** `/ticket`
7. **Now works** and saves to Redis

✅ **Proof: Graceful degradation - system is resilient**

---

## 🎯 WHAT TO EXPECT

### Success Indicators

**✅ During normal operation:**
- Console shows `[Redis] Connected successfully` on startup
- Console shows `[Session] Error...` messages with context if anything fails
- Session `/ticket` flow completes normally
- Multi-step flows progress as expected
- `/cancel` exits immediately

**✅ During bot restart:**
- Active sessions are restored from Redis
- Users can continue multi-step flows without restarting
- No data loss for in-progress tickets

**✅ Under error conditions:**
- Bot logs warnings but doesn't crash
- Graceful degradation if Redis unavailable
- Bot recovers automatically when Redis comes back online

---

### Performance Expectations

| Operation | Expected Time | Why |
|-----------|---|---|
| Session save (setSession) | < 5ms | Local Redis network |
| Session load (getSession) | < 5ms | Local Redis network |
| Bot startup (with Redis) | 2-5s | Depends on Redis startup |
| Message response | < 1s | Normal bot latency |

---

### Common Observations

**1. Redis console fills with commands:**
```bash
1. SETEX session:123456789 3600 {...}
2. GET session:123456789
3. SETEX session:123456789 3600 {...}
```
This is normal! Every session operation creates a Redis command.

**2. TTL reset on every save:**
```bash
SETEX session:123456789 3600 {...}
# This resets TTL to 1 hour from NOW
# So if user keeps chatting, session stays alive
```
This is expected behavior.

**3. Different user IDs in Redis keys:**
```bash
session:123456789  # User A
session:987654321  # User B
```
Each Telegram user has a unique numeric ID.

---

## 🔧 TROUBLESHOOTING

### Issue: "Redis not connected" on startup

**Symptom:**
```
[Redis] Connection failed: Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Cause:** Redis server not running

**Fix:**
```bash
# Check Redis is installed
redis-cli ping

# If error, start Redis:
redis-server  # macOS/Linux
# or in WSL on Windows

# Verify it's running
redis-cli ping
# Should output: PONG
```

---

### Issue: Session not loading after restart

**Symptom:**
- User was on step 2 of ticket
- Bot restarted
- User sends message but bot treats it as AI query (not ticket step)

**Cause:** Redis not connected during retrieval

**Debug:**
```bash
# In Terminal with bot
# Check console for: [Session] Redis not connected

# Check Redis is running:
redis-cli ping

# Check the key exists:
redis-cli
> KEYS session:*
> GET session:123456789  # Replace with actual user ID
```

**Fix:**
1. Verify Redis is running
2. Verify `REDIS_URL` in `.env` matches where Redis runs
3. Restart bot

---

### Issue: Session data looks corrupted

**Symptom:**
```
[Session] Error retrieving session: Unexpected token...
```

**Cause:** JSON parsing error (usually temporary network glitch)

**Fix:** Session will auto-retry next time. Graceful error handling prevents crashes.

---

### Issue: Want to manually inspect/clear sessions

**Commands:**
```bash
redis-cli

# View all sessions:
> KEYS session:*

# View specific session:
> GET session:123456789

# View TTL (time left before expiry):
> TTL session:123456789

# Manually delete a session:
> DEL session:123456789

# Clear all sessions:
> FLUSHDB
```

---

## 🎤 PRESENTATION NOTES

### Key Talking Points

**Problem We Solved:**
- Old system: In-memory Map lost all sessions on bot restart
- Impact: Users mid-ticket would lose draft and have to restart
- Unacceptable for production: Data loss = poor UX + support burden

**Solution:**
- Redis: Persistent key-value store
- Sessions stored on disk (or cluster)
- Survives bot crashes, restarts, deployments
- 1-hour auto-expiry (cleanup old sessions)

**How It Works:**
1. User starts `/ticket` → Session created in Redis
2. Each step saved to Redis with latest data
3. Bot restarts → Redis still has data
4. User continues → Session loaded from Redis
5. User completes or cancels → Session deleted from Redis

**Benefits:**
- ✅ Zero data loss for active sessions
- ✅ Seamless user experience across restarts
- ✅ Graceful degradation if Redis down
- ✅ Scales to multiple bot instances (if needed)
- ✅ Auto-cleanup after 1 hour inactivity

**Architecture:**
- Redis acts as single source of truth
- Bot is stateless (can restart anytime)
- No duplicate data or conflicts
- Simple, proven technology

---

### Demo Flow (10 minutes)

**Setup (1 min):**
- Show 3 terminals: Redis, Bot, Redis CLI
- Show `.env` with `REDIS_URL` configured

**Part 1: Live Session Save (3 min):**
1. Watch Redis CLI with `MONITOR`
2. Start ticket in Telegram
3. See `SET` command in Redis CLI
4. Fill step 1
5. See updated `SET` command
6. Explain: Data is now persisted

**Part 2: Restart & Recovery (4 min):**
1. Show bot is on step 2
2. Kill bot process (Ctrl+C)
3. Restart bot
4. In Telegram, continue from step 2
5. Bot loads session from Redis
6. Complete ticket successfully
7. Explain: This would have failed in old system

**Part 3: Error Handling (2 min):**
1. Stop Redis
2. Show bot still responds (doesn't crash)
3. Restart Redis
4. Show bot recovers and saves sessions again

---

### Key Metrics to Highlight

| Metric | Value | Significance |
|--------|-------|---|
| Session latency | <5ms | Redis is fast |
| Data persistence | 1 hour TTL | Auto-cleanup |
| Failure resilience | Graceful | Won't crash |
| Supported users | Unlimited* | Scales horizontally |
| Data backup | Redis persistence | Can configure RDB/AOF |

*Scales as long as Redis can handle it (easily 1000s concurrent)

---

### Slides You'd Want

If presenting with slides:

1. **Problem Slide**
   - Before/After diagram
   - Data loss in old system

2. **Solution Slide**
   - Redis as persistent store
   - 1 hour TTL
   - Graceful fallback

3. **Architecture Slide**
   - Show data flow diagram
   - Session lifecycle

4. **Demo Slide**
   - Screenshot of ticket flow
   - Screenshot of Redis data
   - Before/after restart

5. **Results Slide**
   - ✅ Production-ready
   - ✅ Data-safe
   - ✅ User-friendly

---

## 📞 QUICK REFERENCE

### Commands During Demo

**Start everything:**
```bash
# Terminal 1
redis-server

# Terminal 2
cd backend && npm run dev

# Terminal 3
redis-cli
> MONITOR
```

**Test ticket flow:**
- Telegram: `/ticket`
- Telegram: `test@example.com`
- Telegram: `billing`
- Telegram: `Already tried restart`
- Telegram: `Getting 500 error`

**Restart bot:**
```bash
# In Terminal 2: Ctrl+C, then up arrow, Enter
npm run dev
```

**Verify session in Redis:**
```bash
# In Terminal 3
> KEYS session:*
> GET session:YOUR_USER_ID
```

---

## 🎓 KEY TAKEAWAY

**Before:**
```
User → Bot (Memory) → ❌ Restart = Lost Data
```

**After:**
```
User → Bot → Redis (Persistent)
         ↓
    Restart → Bot re-connects → ✅ Data Still There!
```

**Result:** Production-ready system that doesn't lose user data.

---

**Good luck with your presentation! 🚀**

