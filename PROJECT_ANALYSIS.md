# 🤖 GOJO HOST TELEGRAM BOT - PROJECT ANALYSIS

**Project Name:** GOJO Host Telegram Bot  
**Last Updated:** May 7, 2026  
**Status:** Early Production / MVP Stage  

---

## 📑 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Current Stage](#current-stage)
3. [Technology Stack](#technology-stack)
4. [What It Does](#what-it-does)
5. [How It Works](#how-it-works)
6. [Project Structure](#project-structure)
7. [Configuration](#configuration)
8. [Features & Functionality](#features--functionality)
9. [What's Working](#whats-working)
10. [What's Missing / TODO](#whats-missing--todo)
11. [Build & Run Instructions](#build--run-instructions)
12. [Architecture Diagrams](#architecture-diagrams)
13. [Development Notes](#development-notes)
14. [Next Steps & Recommendations](#next-steps--recommendations)

---

## 📊 PROJECT OVERVIEW

**GOJO Host Telegram Bot** is a **customer support & information assistant** for GojoHost, an Ethiopian unlimited web hosting company based in Addis Ababa.

The bot provides:
- **AI-powered chat** for instant answers about hosting plans, pricing, and technical support
- **Structured support hub** with 12 categories of guides and troubleshooting articles
- **Automation tools** for ticket drafting and account verification
- **Real-time DNS checking** for domain diagnostics
- **Telegram Mini App** — a full-featured web frontend accessible directly from Telegram

### Company Information
- **Name:** GojoHost (ጐጆ Host)
- **Location:** Addis Ababa, Ethiopia
- **Website:** https://gojohost.net
- **Target Users:** Small businesses, startups, developers, agencies, individuals in Ethiopia
- **Specialization:** Unlimited web hosting with excellent local support

---

## 🎯 CURRENT STAGE

### Status: **Early Production / MVP (Minimum Viable Product)**

**What's Production-Ready:**
- ✅ Core bot functionality operational
- ✅ All major commands implemented and tested
- ✅ AI integration with GROQ LLM working
- ✅ Frontend mini-app deployed and functional
- ✅ Basic security (HMAC verification of Telegram data)
- ✅ Support guide system with 12 topic categories

**What Needs Work:**
- ⚠️ No automated tests (unit/integration/e2e)
- ⚠️ No production deployment pipeline (Docker, PM2, systemd)
- ⚠️ Session storage is in-memory (will lose data on restart)
- ⚠️ Error handling is basic
- ⚠️ Logging is minimal (console.log only)
- ⚠️ No rate limiting or advanced security
- ⚠️ Some UI screens are stubs (Blog, Settings partially incomplete)

### Maturity Score: **6/10**
- Core features: 9/10
- Code quality: 6/10
- Testing: 0/10
- Documentation: 5/10
- Deployment readiness: 3/10

---

## 🔧 TECHNOLOGY STACK

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | LTS | Runtime |
| **Express.js** | 5.2.1 | HTTP server |
| **Telegraf** | 4.16.3 | Telegram bot framework (primary) |
| **node-telegram-bot-api** | 0.63.0 | Alternative Telegram SDK (legacy) |
| **GROQ API** | Latest | LLM for AI responses |
| **Axios** | 1.13.2 | HTTP client for API calls |
| **dotenv** | 17.2.3 | Environment variable management |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **nodemon** | 3.1.11 | Development hot-reload |

**Module Type:** CommonJS (not ES Modules)

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.2.35 | React framework (App Router) |
| **React** | 18 | UI library |
| **React DOM** | 18 | DOM rendering |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS |
| **PostCSS** | 8 | CSS processing |
| **ESLint** | 8 | Linting |
| **Telegram WebApp SDK** | Via script tag | Telegram mini-app integration |

**Language:** TypeScript with strict type checking

### Integration APIs

| Service | Usage | Authentication |
|---|---|---|
| **GROQ API** | LLM completions (llama-3.1-8b-instant) | API Key |
| **Telegram Bot API** | Bot commands, messages, updates | Bot Token |
| **Telegram WebApp API** | Mini-app initialization, verification | initData + HMAC |
| **Node DNS** | DNS record lookups | Native |

---

## 📋 WHAT IT DOES

### High-Level Purpose
A **unified customer support platform** for GojoHost, combining:
1. **Instant AI answers** via GROQ LLM
2. **Structured self-service guides** organized by topic
3. **Automated workflows** for common support tasks
4. **Real-time diagnostics** (DNS checking)
5. **Modern web interface** accessible from Telegram

### Primary Use Cases

#### 1. **Fast Technical Support**
User asks: "How do I reset my cPanel password?"
→ Bot instantly replies with step-by-step instructions

#### 2. **Pricing & Plans Information**
User: "What are your hosting plans?"
→ AI gives detailed pricing and feature comparison

#### 3. **DNS Troubleshooting**
User: `/dns example.com MX`
→ Bot performs live DNS lookup and shows results

#### 4. **Account Issues**
User: `/ticket`
→ Bot guides through 4-step ticket creation wizard

#### 5. **Verification Processes**
User: `/verify`
→ Bot validates account ownership for sensitive changes

---

## 🏗️ HOW IT WORKS

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              TELEGRAM ECOSYSTEM                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐  Direct Chat      ┌────────────┐ │
│  │   Telegram Bot   │◄──────────────────┤  User/Chat │ │
│  │                  │                    └────────────┘ │
│  └────────┬─────────┘                                    │
│           │                                              │
│  ┌────────▼─────────┐  Mini App         ┌────────────┐ │
│  │  Telegram WebApp │◄──────────────────┤  User/Web  │ │
│  │  (Browser)       │                    └────────────┘ │
│  └──────────────────┘                                    │
│                                                          │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
        Long Polling                  WebApp SDK
               │                           │
┌──────────────▼───────────┐   ┌──────────▼──────────────┐
│    BACKEND (Node.js)      │   │  FRONTEND (Next.js)    │
├──────────────────────────┤   ├───────────────────────┤
│ - Telegraf Bot Framework  │   │ - React App Router    │
│ - Command Handlers        │   │ - 5 Navigation Tabs   │
│ - Session Management      │   │ - TypeScript          │
│ - GROQ AI Integration     │   │ - Tailwind CSS        │
│ - DNS Lookup              │   │ - API Routes          │
│ - Guide System            │   │ - User Auth           │
│ - Ticket/Verify Flows     │   │                       │
└──────────────┬────────────┘   └───────────┬───────────┘
               │                           │
               └───────────────┬───────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
     ┌──────▼──────┐    ┌──────▼──────┐  ┌──────▼──────┐
     │  GROQ API   │    │  Telegram   │  │  Node DNS   │
     │  (LLM)      │    │  API        │  │  (DNS)      │
     └─────────────┘    └─────────────┘  └─────────────┘
```

### Data Flow - User Sends Message

```
User (Telegram) sends text message
          ↓
Telegram servers receive
          ↓
Backend bot receives via long polling
          ↓
Is it a command? (/start, /menu, etc.)
          ├─ YES → Command handler
          │        (e.g., bot.command("menu", ...))
          │        → buildMenu() → send inline keyboard
          │
          └─ NO → Is text message
                  ↓
                  Has active session? (ticket/verify flow)
                  ├─ YES → handleSessionText()
                  │        → Continue multi-step wizard
                  │        → Progress through steps
                  │        → Save draft in memory
                  │
                  └─ NO → Is GROQ_API_KEY set?
                         ├─ YES → Call GROQ API
                         │        Send system prompt + user message
                         │        ↓
                         │        GROQ returns AI response
                         │        ↓
                         │        Split into chunks (4096 char limit)
                         │        ↓
                         │        Send to user
                         │
                         └─ NO → Return error message
```

### Data Flow - User Opens Mini App

```
User opens Telegram Mini App
          ↓
Next.js page loads
          ↓
useTelegram hook executes
          ├─ Load Telegram WebApp SDK (retry up to 30 times)
          ├─ Initialize: tg.ready() + tg.expand()
          ├─ Extract user data from WebApp
          │
          └─ Verify initData (call /api/me)
             ├─ POST initData to backend
             │   ↓
             │   Verify HMAC-SHA256 signature
             │   ├─ Valid → Return user data
             │   └─ Invalid → Return error
             │
             └─ Set user context in React state
                ↓
                AppShell renders with user info
                ↓
                User can navigate 5 tabs:
                ├─ Home (user info, GojoHost intro)
                ├─ Chat (AI assistant via /api/chat)
                ├─ Support (structured hub guides)
                ├─ Blog (content - stub)
                └─ Settings (preferences - stub)
```

### Session Flow - Ticket Creation Example

```
User sends /ticket
          ↓
startTicketFlow() called
          ↓
Create session object:
{
  type: "ticket",
  step: 1,
  draft: {}
}
          ↓
Send message: "Step 1 of 4 — Account email on file"
          ↓
User sends reply with email
          ↓
handleSessionText() intercepts message
          ├─ Check session exists
          ├─ Validate input (email format)
          ├─ Save to draft: draft.email = input
          ├─ Increment step: step = 2
          │
          └─ Send: "Step 2 of 4 — Issue description"
                   (repeat until step 4)
                   ↓
                   All steps complete
                   ├─ Compile final draft
                   ├─ Clear session
                   └─ Send summary message
                      "Your ticket draft: [preview]"
```

---

## 📁 PROJECT STRUCTURE

### Directory Layout

```
GOJO_TG_BOT/
├── readme.md                          (Empty - needs content)
├── PROJECT_ANALYSIS.md               (This file)
├── .env.example                       (Configuration template)
│
├── backend/                           (Node.js / Telegraf)
│   ├── package.json                   (Dependencies)
│   ├── .env                           (Actual env variables)
│   ├── .env.example                   (Env template)
│   ├── index.js                       (Entry point)
│   ├── bot.js                         (Main bot commands & handlers)
│   │
│   └── support/                       (Support system modules)
│       ├── hub.js                     (Support menu structure & keyboard)
│       ├── categories.js              (12-category topic tree)
│       ├── guides.js                  (Answer templates for each topic)
│       ├── flows.js                   (Ticket & verify multi-step flows)
│       ├── session-store.js           (In-memory user session storage)
│       ├── dns-check.js               (DNS record lookup utility)
│       ├── urls.js                    (URL builder from env variables)
│       ├── apply-template.js          (Variable substitution {{VAR}})
│       ├── welcome-keyboard.js        (Quick-action button layout)
│       ├── split-message.js           (Chunk messages for Telegram limit)
│       ├── mini-app-url.js            (Resolve mini-app HTTPS URL)
│       └── startup-hints.js           (Dev-time configuration hints)
│
└── frontend/                          (Next.js / React / TypeScript)
    ├── package.json                   (Dependencies)
    ├── next.config.mjs                (Next.js configuration)
    ├── tsconfig.json                  (TypeScript configuration)
    ├── tailwind.config.ts             (Tailwind CSS config)
    ├── postcss.config.mjs             (PostCSS config)
    ├── next-env.d.ts                  (Auto-generated type definitions)
    ├── README.md                      (Empty - needs content)
    │
    └── src/
        ├── app/
        │   ├── layout.tsx              (Root layout, Telegram SDK script)
        │   ├── page.tsx                (Home page - renders AppShell)
        │   ├── globals.css             (Global Tailwind directives)
        │   │
        │   ├── fonts/                  (Custom font files if any)
        │   │
        │   └── api/                    (Next.js API routes)
        │       ├── chat/
        │       │   └── route.ts        (POST /api/chat - AI chat endpoint)
        │       │
        │       └── me/
        │           └── route.ts        (POST /api/me - User auth verification)
        │
        ├── components/
        │   ├── AppShell.tsx            (Main container, tab router)
        │   ├── BottomNav.tsx           (Navigation tabs component)
        │   ├── ChatBox.tsx             (Chat input/output component)
        │   ├── TelegramUserCard.tsx    (User info display)
        │   │
        │   └── screens/                (Tab content - 5 views)
        │       ├── HomeScreen.tsx      (Welcome, user info)
        │       ├── ChatScreen.tsx      (AI assistant interface)
        │       ├── SupportScreen.tsx   (Structured support hub)
        │       ├── BlogScreen.tsx      (Content/articles - stub)
        │       └── SettingsScreen.tsx  (Preferences - stub)
        │
        ├── hooks/
        │   └── useTelegram.ts          (Telegram SDK initialization hook)
        │
        ├── types/
        │   ├── telegram.ts             (Telegram data type definitions)
        │   └── navigation.ts           (Tab and route types)
        │
        ├── utils/
        │   ├── telegram.ts             (Telegram utility functions)
        │   └── telegram-user.ts        (User data extraction helpers)
        │
        └── data/
            └── support-categories.ts   (Support category definitions)
```

### File Descriptions

#### **Backend Key Files**

| File | Lines | Purpose |
|---|---|---|
| `bot.js` | ~350 | Main bot with all command handlers and AI integration |
| `index.js` | ~50 | Entry point, loads env, launches bot with error handling |
| `support/hub.js` | ~200 | Support menu builder, callback handlers, inline keyboards |
| `support/categories.js` | ~80 | 12-category tree structure with sub-items |
| `support/guides.js` | ~500+ | Template strings for all guides with {{VAR}} support |
| `support/flows.js` | ~200 | Ticket & verify multi-step flow controllers |
| `support/session-store.js` | ~30 | Simple in-memory session storage (Map-based) |
| `support/dns-check.js` | ~80 | Node DNS resolver for A/AAAA/MX/TXT/NS/CNAME |
| `support/urls.js` | ~20 | Build URLs from env variables |
| `support/apply-template.js` | ~20 | Replace {{PLACEHOLDERS}} in text |
| `support/split-message.js` | ~30 | Split long messages (Telegram 4096 char limit) |

#### **Frontend Key Files**

| File | Type | Purpose |
|---|---|---|
| `src/app/layout.tsx` | TSX | Root layout, loads Telegram SDK script |
| `src/app/page.tsx` | TSX | Home page entry point |
| `src/app/api/chat/route.ts` | TS API | POST handler for AI chat requests |
| `src/app/api/me/route.ts` | TS API | POST handler for user auth/verification |
| `src/hooks/useTelegram.ts` | TS Hook | Telegram WebApp initialization (retry logic) |
| `src/components/AppShell.tsx` | TSX | Main app container, tab routing |
| `src/components/ChatBox.tsx` | TSX | Chat UI component |
| `src/components/BottomNav.tsx` | TSX | Navigation tabs |
| `src/components/screens/*.tsx` | TSX | 5 tab screens |
| `src/types/telegram.ts` | TS | Telegram type definitions |
| `src/utils/telegram-user.ts` | TS | Extract user from WebApp |

---

## ⚙️ CONFIGURATION

### Environment Variables

Create a `.env` file in the `backend/` directory with these variables:

#### **Required Variables**

```bash
# Telegram Bot Token (get from @BotFather)
BOT_TOKEN=<your-bot-token-here>

# GROQ API Key (for AI responses)
# Get from: https://console.groq.com/keys
GROQ_API_KEY=<your-groq-api-key>

# Mini App URL (must be public HTTPS)
# For local dev: use ngrok or Cloudflare Tunnel
# Example: https://abc123.ngrok.io
MINI_APP_URL=<your-https-url-to-frontend>
```

#### **Company Configuration**

```bash
# URLs used in guides and support information
BASE_URL=https://gojohost.net
CLIENT_AREA_URL=https://gojohost.net/client-area
CPANEL_URL_HINT=https://gojohost.net/cpanel-login
WEBMAIL_URL_HINT=https://webmail.yourdomain.com

# Support contact information (shown in /support command)
SUPPORT_EMAIL=support@gojohost.net
SUPPORT_PHONE=+251940248788
SUPPORT_TELEGRAM=@GojoHostSupport

# Domain registration portal
DOMAIN_PORTAL_URL=https://gojohost.net
```

### Environment Variable Usage

Variables are used throughout the codebase:

```javascript
// In bot.js
const u = buildUrls();  // Returns object with all URLs from env
await ctx.reply(`Email: ${u.SUPPORT_EMAIL}`);

// In support/guides.js (templates)
const guide = `Contact: {{SUPPORT_EMAIL}} or {{SUPPORT_PHONE}}`;

// In frontend/src/app/api/me/route.ts
const botToken = process.env.BOT_TOKEN;
```

---

## ✨ FEATURES & FUNCTIONALITY

### 1. **Bot Commands** (in Telegram chat)

| Command | Description | Implemented | Notes |
|---|---|---|---|
| `/start` | Welcome message + quick links | ✅ | Shows mini-app link + main features |
| `/menu` | Support hub (12 categories) | ✅ | Interactive button menu |
| `/help` | List all commands | ✅ | Shows all available commands |
| `/plans` | Hosting plans & pricing | ✅ | Quick pricing summary |
| `/domain` | Domain registration portal | ✅ | Links to domain portal |
| `/dns` | DNS lookup tool | ✅ | Usage: `/dns example.com MX` |
| `/ticket` | Support ticket wizard | ✅ | 4-step flow |
| `/verify` | Account verification | ✅ | 3-step flow |
| `/cancel` | Exit ticket/verify flow | ✅ | Clears session |
| `/support` | Contact information | ✅ | Email, phone, Telegram, portal links |
| `/keyboard` | Show quick buttons | ✅ | Restore bottom keyboard |

### 2. **AI Chat Capabilities**

**Model:** GROQ llama-3.1-8b-instant  
**Temperature:** 0.7 (balanced creative + factual)  
**Max Tokens:** 500 per response  

**Training Data Includes:**
- GojoHost hosting plans and pricing
- Service features (cPanel, Windows, VPS, Reseller)
- Features (unlimited SSD, free SSL, backups, CDN)
- Support contacts and payment methods
- Unique selling points (Ethiopian-based, local support)

**Capabilities:**
- ✅ Answer questions about hosting plans
- ✅ Explain technical concepts
- ✅ Suggest relevant GojoHost services
- ✅ Provide troubleshooting guidance
- ✅ Handle Amharic (Ethiopian language) queries
- ✅ Format responses with Markdown

### 3. **Support Hub** (12 Categories)

The structured guide system organized by topic:

1. **Account & Login** (8 sub-items)
   - Reset cPanel password
   - Reset Plesk / Client Area
   - cPanel login URL
   - Webmail login URL
   - Find username
   - Change passwords guide
   - Recover lost credentials
   - Verify ownership

2. **Domain & DNS** (5 sub-items)
   - Domain setup for hosting
   - DNS records explanation (A/CNAME/MX/TXT)
   - Nameserver update process
   - Propagation & checking
   - Addon & subdomains

3. **Website Troubleshooting** (7 sub-items)
   - Site not loading
   - HTTP 500 error
   - Database connection issues
   - White / blank screen
   - File permissions
   - SSL certificate issues
   - Malware / hacked warning

4. **Email & Webmail** (5 sub-items)
   - Email setup in cPanel
   - Webmail access
   - Email forwarding
   - Spam filter configuration
   - Email troubleshooting

5. **cPanel / Plesk Control Panels** (5 sub-items)
   - cPanel interface tour
   - File manager basics
   - Database management
   - Email settings
   - Backup & restore

6. **Billing & Payments** (4 sub-items)
   - Payment methods
   - Invoice viewing
   - Billing cycle
   - Refund policy

7. **Security & DDoS Protection** (4 sub-items)
   - Imunify360 protection
   - Firewall configuration
   - Account security best practices
   - Hacking recovery steps

8. **VPS Hosting** (4 sub-items)
   - VPS setup & access
   - Server management basics
   - Security hardening
   - Performance optimization

9. **Reseller Hosting** (3 sub-items)
   - Reseller panel setup
   - Creating hosting accounts
   - WHM basics

10. **WordPress & CMS** (4 sub-items)
    - WordPress installation
    - Plugin/theme installation
    - Database optimization
    - WordPress security

11. **API & Custom Integration** (3 sub-items)
    - API documentation
    - Integration examples
    - Custom scripts

12. **Escalation to Human Support** (2 sub-items)
    - Create support ticket
    - Contact support team

### 4. **DNS Lookup Tool**

```bash
Usage: /dns <domain> [record_type]
Examples:
  /dns gojohost.net           # Returns A records
  /dns gojohost.net MX        # Returns MX records
  /dns gojohost.net TXT       # Returns TXT records
```

**Supported Record Types:**
- A (IPv4 address)
- AAAA (IPv6 address)
- MX (Mail exchange)
- TXT (Text records)
- NS (Nameservers)
- CNAME (Canonical name)

**Implementation:** Uses Node.js built-in DNS module (no external API)

### 5. **Ticket Creation Wizard** (`/ticket`)

**4-Step Flow:**
1. **Email** - Account email on file (validation: basic email regex)
2. **Issue Type** - Select from: Technical, Billing, Domain, Other
3. **Subject** - Brief description of problem
4. **Details** - Detailed explanation

**Output:**
- Summary message with all collected info
- Ready to forward to support team
- Stored in memory (not persisted)

### 6. **Account Verification Wizard** (`/verify`)

**3-Step Flow:**
1. **Domain** - Domain name tied to hosting (e.g., example.com)
2. **Email** - Associated account email
3. **Reason** - Purpose of verification

**Output:**
- Verification checklist
- Ready for sensitive account changes
- Stored in memory (not persisted)

### 7. **Telegram Mini App**

Accessible from Telegram menu → opens Next.js frontend

**5 Tab Navigation:**

#### **Home Tab**
- Welcome message
- User information display (if logged in)
- GojoHost introduction
- Quick feature highlights

#### **Chat Tab**
- Full AI conversation interface
- Message input box
- Conversation history
- Real-time responses from GROQ

#### **Support Tab**
- Mirror of `/menu` structure
- All 12 category guides
- Nested sub-items
- Searchable interface (planned)

#### **Blog Tab** (Stub)
- Placeholder for content
- Would show articles, announcements
- Backend integration needed

#### **Settings Tab** (Stub)
- User preferences
- Account information
- Language selection (planned)
- Backend integration needed

### 8. **User Authentication**

**Mini App User Verification:**
```typescript
// HMAC-SHA256 verification
secret_key = HMAC-SHA256("WebAppData", botToken)
computed_hash = HMAC-SHA256(secret_key, dataCheckString)
verified = (computed_hash === provided_hash)
```

**Data Extracted from Telegram:**
- User ID
- First name
- Last name
- Username
- Language code
- Is premium flag
- Allows write access flag

---

## ✅ WHAT'S WORKING

### Backend Bot
- ✅ Command parsing and routing
- ✅ All 11 commands functional
- ✅ GROQ API integration and responses
- ✅ Support menu with dynamic keyboard generation
- ✅ Multi-step flow execution (ticket, verify)
- ✅ Session state management
- ✅ DNS lookups with multiple record types
- ✅ Message splitting for long responses
- ✅ Environment variable configuration
- ✅ Error handling for API failures
- ✅ Markdown text formatting
- ✅ Long polling activation and shutdown handling

### Frontend Mini App
- ✅ Telegram WebApp SDK initialization
- ✅ User authentication (initData verification)
- ✅ Tab-based navigation
- ✅ Responsive UI (mobile optimized)
- ✅ Chat interface with message display
- ✅ API integration (/api/chat, /api/me)
- ✅ TypeScript type safety
- ✅ Tailwind CSS styling
- ✅ User info display
- ✅ Hot reload during development

### Integration
- ✅ Bot ↔ Mini App communication
- ✅ WebApp data payload handling
- ✅ Environment variable passing
- ✅ Cross-origin requests (CORS)
- ✅ HTTPS requirement enforcement for mini app

---

## ❌ WHAT'S MISSING / TODO

### High Priority (Blocking Production)

1. **Persistent Data Storage**
   - Sessions currently in-memory (lost on restart)
   - Need: Redis or PostgreSQL
   - Impact: Ticket drafts, verify flows, user preferences

2. **Error Handling & Logging**
   - Limited error messages
   - No structured logging
   - No retry logic for API failures
   - No graceful degradation

3. **Production Deployment**
   - No Docker configuration
   - No PM2 config
   - No systemd service file
   - No database migration scripts
   - No backup strategy

4. **Rate Limiting & Security**
   - No API rate limiting
   - No request throttling
   - No DDoS protection
   - No input validation on some endpoints
   - No CORS whitelist

5. **Testing**
   - Zero unit tests
   - Zero integration tests
   - No E2E testing
   - No test coverage reporting

### Medium Priority (Improves UX)

6. **Blog & Settings Screens**
   - Blog: No backend content source
   - Settings: No preference persistence
   - Need: CMS or content API

7. **Search Functionality**
   - Support guides not searchable
   - No full-text search
   - Need: Search implementation

8. **Offline Support**
   - No service worker
   - No offline mode
   - Mini app requires constant connection

9. **Analytics**
   - No user behavior tracking
   - No command usage statistics
   - No error tracking (Sentry, etc.)

10. **Internationalization (i18n)**
    - System mentions Amharic support but not implemented
    - English only for now
    - Need: i18n library + translations

11. **Frontend README**
    - Empty `frontend/README.md`
    - No setup instructions
    - No deployment guide

### Low Priority (Nice to Have)

12. **Performance Optimization**
    - No caching layer
    - No image optimization
    - No lazy loading
    - No database query optimization

13. **Admin Dashboard**
    - No way to manage guides
    - No ticket tracking system
    - No analytics dashboard

14. **Advanced Features**
    - No file uploads
    - No rich media in responses
    - No webhook support (only long polling)
    - No background jobs system

15. **Documentation**
    - No API documentation (Swagger/OpenAPI)
    - No deployment runbook
    - No troubleshooting guide
    - Architecture diagrams missing

---

## 🚀 BUILD & RUN INSTRUCTIONS

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn**
- **ngrok** or **Cloudflare Tunnel** (for local mini-app testing)
- **Telegram Bot Token** (from @BotFather)
- **GROQ API Key** (from https://console.groq.com)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env
# Edit .env with:
#   BOT_TOKEN=<your-token>
#   GROQ_API_KEY=<your-key>
#   MINI_APP_URL=<https://url-to-frontend>
#   (and other config)

# Run in development (with hot reload)
npm run dev

# Or run in production
npm start
```

**Output when running:**
```
[startup] Long polling active. Press Ctrl+C to stop.
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local if needed (usually not required)
# Frontend gets config from backend via API calls

# Run development server (default: http://localhost:3000)
npm run dev

# For production, build first
npm run build
npm start

# Lint and type-check
npm run lint
```

**For Local Mini-App Testing:**

1. Start frontend: `npm run dev` (port 3000)
2. Expose with HTTPS tunnel:
   ```bash
   # Using ngrok
   ngrok http 3000
   # Copy HTTPS URL: https://abc123.ngrok.io

   # OR using Cloudflare Tunnel
   cloudflared tunnel --url http://localhost:3000
   ```
3. Set `MINI_APP_URL=https://your-tunnel-url` in backend `.env`
4. Set mini-app URL in Telegram bot settings (@BotFather → Edit Commands → Mini App URL)
5. Restart backend bot
6. Open Telegram, find bot, tap "Menu" → mini-app button

### Running Both Together

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Terminal 3 - HTTPS Tunnel (for local):**
```bash
ngrok http 3000
```

Update `MINI_APP_URL` in `.env` with ngrok URL and restart backend.

### Docker (Future)

Not implemented yet, but would look like:

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "index.js"]

# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

---

## 📊 ARCHITECTURE DIAGRAMS

### System Components

```
┌────────────────────────────────────────────────────────────────┐
│                    TELEGRAM PLATFORM                           │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │  Long Polling Connection         WebApp Frame             │  │
│ │  ↓                               ↓                        │  │
│ │  ┌──────────────┐        ┌──────────────────┐           │  │
│ │  │  Telegram    │        │  Telegram WebApp │           │  │
│ │  │  Bot API     │        │  Browser SDK     │           │  │
│ │  └──────────────┘        └──────────────────┘           │  │
│ └──────────────────────────────────────────────────────────┘  │
│           │                              │                    │
└───────────┼──────────────────────────────┼────────────────────┘
            │                              │
     ┌──────▼───────┐            ┌────────▼──────────┐
     │ Backend      │            │ Frontend         │
     │ (Node.js)    │            │ (Next.js)        │
     ├──────────────┤            ├──────────────────┤
     │ • Telegraf   │  ◄────────►│ • React          │
     │ • Express    │   HTTP/API │ • TypeScript     │
     │ • GROQ LLM   │            │ • Tailwind       │
     │ • DNS Lib    │            │ • WebApp SDK     │
     │ • Sessions   │            │ • Routes         │
     └──────────────┘            └──────────────────┘
            │                              │
     ┌──────┴──────┐            ┌────────┴──────────┐
     │ GROQ API    │            │ /api/chat         │
     │ llama 3.1   │            │ /api/me           │
     └─────────────┘            └───────────────────┘
```

### Data Models

**User Session (In-Memory)**
```javascript
{
  userId: 123456789,
  type: "ticket" | "verify",
  step: 1,
  draft: {
    email: "user@example.com",
    issueType: "Technical",
    subject: "Cannot login",
    details: "..."
  }
}
```

**Support Category**
```javascript
{
  title: "Account & Login",
  children: [
    {
      title: "Reset cPanel password",
      guideKey: "acct_cpanel_reset"
    },
    // ...
  ]
}
```

**Guide Template**
```javascript
{
  guideKey: "acct_cpanel_reset",
  content: `To reset cPanel password:
1. Go to {{BASE_URL}}/client-area
2. Click "Reset Password"
3. Check {{SUPPORT_EMAIL}} for link
...`
}
```

### API Endpoints

**Frontend ← Backend**

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/chat` | POST | No | Send message, get AI response |
| `/api/me` | POST | initData | Verify user, get profile |

**Telegram → Backend**

| Trigger | Type | Purpose |
|---|---|---|
| `/start` | Command | Welcome flow |
| `/menu` | Command | Show support hub |
| Text message | Handler | AI chat or session continuation |
| Button press | Callback | Navigate support categories |

---

## 🛠️ DEVELOPMENT NOTES

### Code Quality Observations

**Strengths:**
- Clean separation of concerns (bot.js, support/*, routes)
- Consistent error handling patterns
- Good use of template variables
- Type-safe frontend (TypeScript)
- Responsive design approach

**Areas for Improvement:**
- No input validation framework (validation is ad-hoc)
- No API documentation
- Support guides could be in database instead of hardcoded
- Session store should use external storage
- Duplicate SYSTEM_PROMPT in bot.js and route.ts

### Debugging Tips

**Bot not responding:**
1. Check `BOT_TOKEN` is valid in `.env`
2. Check internet connection
3. Verify no other bot instance is polling (409 error = conflict)
4. Check logs: `npm run dev` shows all console.log

**Mini-app won't load:**
1. Check `MINI_APP_URL` is public HTTPS
2. Check ngrok/tunnel is still running
3. Check frontend responds to HTTPS URL
4. Check browser console for errors

**AI responses are slow:**
1. GROQ API can be slow during high load
2. Timeout is 45 seconds (reasonable)
3. Check `GROQ_API_KEY` is valid
4. Add logging to see when API is called

**DNS lookup fails:**
1. Check domain spelling
2. Some records might not be configured
3. Nameservers might need time to propagate
4. Try different record type (A vs AAAA)

### Common Issues & Fixes

| Issue | Cause | Solution |
|---|---|---|
| "409 Conflict" error | Another bot instance polling | Stop other processes, use webhooks instead |
| Mini-app loads but blank | Frontend not responding | Check frontend runs, check HTTPS URL |
| AI returns error message | `GROQ_API_KEY` missing | Set `GROQ_API_KEY` in `.env` |
| `/menu` buttons don't work | Session not initialized | Try `/cancel` then `/menu` again |
| DNS lookup "ENOTFOUND" | Domain invalid or no nameserver | Verify domain name, check nameservers |

---

## 🎯 NEXT STEPS & RECOMMENDATIONS

### Immediate (Week 1)

**1. Add Persistent Storage**
```bash
npm install redis  # or mongoose for MongoDB
```
- Replace `session-store.js` in-memory Map with Redis/DB
- Benefits: Survive restarts, scale to multiple instances

**2. Write Unit Tests**
```bash
npm install --save-dev jest @testing-library/react
```
- Test utility functions (dns-check, apply-template, split-message)
- Test command handlers
- Aim for 50%+ coverage

**3. Document README**
- Add setup instructions
- Add API documentation
- Add deployment guide

### Short-term (Month 1)

**4. Add Rate Limiting**
```bash
npm install express-rate-limit
```
- Limit: 5 messages per user per 10 seconds
- Prevent abuse and API overages

**5. Structured Logging**
```bash
npm install winston
```
- Log all major operations
- Enable debugging in production
- Track errors for monitoring

**6. Input Validation**
```bash
npm install joi zod
```
- Validate email in ticket flow
- Validate domain in DNS command
- Sanitize all user inputs

**7. Database Schema**
```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  userId BIGINT,
  email VARCHAR(255),
  subject VARCHAR(255),
  details TEXT,
  status VARCHAR(50),
  createdAt TIMESTAMP
);

CREATE TABLE user_preferences (
  userId BIGINT PRIMARY KEY,
  language VARCHAR(10),
  theme VARCHAR(10),
  notifications BOOLEAN
);
```

### Mid-term (Month 2-3)

**8. Docker & Deployment**
- Write Dockerfile for both services
- Create docker-compose.yml
- Deploy to AWS/GCP/DigitalOcean
- Set up CI/CD (GitHub Actions)

**9. Blog Content System**
- Create API endpoint to serve blog posts
- Migrate guides from hardcoded to database
- Allow admin panel to edit guides

**10. Analytics**
- Track command usage
- Monitor API errors
- User engagement metrics

### Long-term (Ongoing)

**11. Advanced Features**
- File upload support (screenshots for tickets)
- Rich message formatting
- Multi-language support (Amharic)
- Offline mode (PWA)

**12. Performance**
- Caching layer (Redis)
- CDN for frontend assets
- Database query optimization

**13. Admin Dashboard**
- View all tickets
- Manage support guides
- Analytics dashboard
- User management

---

## 📚 REFERENCE RESOURCES

### Documentation Links
- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini App Docs](https://core.telegram.org/bots/webapps)
- [Next.js Documentation](https://nextjs.org/docs)
- [GROQ API Docs](https://console.groq.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Related Files
- [Backend .env.example](backend/.env.example)
- [Frontend Configuration](frontend/tsconfig.json)
- [Next.js Config](frontend/next.config.mjs)

---

## 🎓 CONCLUSION

**GOJO Host Telegram Bot** is a solid MVP that combines modern tech with practical customer support needs. The architecture is sound, the features are useful, and the codebase is maintainable.

**Current Status:** ✅ MVP Ready for User Testing  
**Production Ready:** ⚠️ Needs hardening (testing, logging, persistence)  
**Next Goal:** Deploy with persistent storage + monitoring

The project has strong fundamentals and clear growth path. Focus on:
1. Persistence (don't lose user data)
2. Testing (confidence in changes)
3. Monitoring (know when things break)
4. Deployment (get users to it)

---

**Last Updated:** May 7, 2026  
**Prepared For:** Development Team  
**Status:** DRAFT - Ready for Review
