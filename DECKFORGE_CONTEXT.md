# DeckForge V2 - Project Context & Specifications

**Last Updated**: 2026-02-22
**Status**: Ready for implementation (Node.js v24.13.1 installed)
**Full Plan**: See `C:\Users\HP\.claude\plans\parsed-rolling-pascal.md` (1,271 lines)

---

## 🎯 Project Vision

**The "AI Canva for Consulting"** - A SaaS platform covering the entire consulting value chain: data → insights → recommendations → visualization.

**Phase 1 Focus**: Visual Intelligence (AI-powered deck generation)

### The Innovation: Self-Expanding Component Library

- **Traditional approach**: Build 38 fixed templates
- **DeckForge approach**: Start with 50+ components, then EXTRACT new components from every deck created
- When User A creates a custom timeline, it becomes available to ALL users
- The library grows exponentially with usage

---

## 💰 Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 decks/month, watermark, public component library |
| **Pro** | $29/mo | Unlimited decks, custom branding, priority generation |
| **Enterprise** | $99/mo | API access, private component library, team collaboration |

**Future Revenue**: Data packages (Ethiopia business data, market research, etc.)

---

## 🏗️ Tech Stack

### Speed-Optimized for Free Tiers

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend/Backend** | Next.js 14 (App Router) + TypeScript | All-in-one, Vercel deploys in 2 min |
| **UI** | Shadcn/ui + Tailwind CSS | Pre-built components, copy-paste speed |
| **Database** | Supabase PostgreSQL | Built-in auth, storage, real-time, generous free tier (500MB, 50K MAU) |
| **ORM** | Prisma | Type-safe, fast migrations, great DX |
| **AI** | Anthropic Claude API | Sonnet 4 (parser + mapper), Haiku 4 (chat editor) |
| **Image Gen** | Replicate (Flux/SDXL) | Pay-per-use, no monthly minimum |
| **Presentation** | PptxGenJS | Free, mature, server-side rendering |
| **Storage** | Supabase Storage | S3-compatible, 1GB free tier |
| **Payments** | Stripe | Industry standard |
| **Deployment** | Vercel | Zero-config Next.js, 100GB bandwidth/month free |

**Monthly Cost** (first 1000 users):
- Supabase: $0 (free tier)
- Vercel: $0 (free tier)
- Claude API: ~$50 (500 decks × $0.10 avg)
- Replicate: ~$20 (100 images × $0.20)
- **Total: ~$70/month** until free tier limits hit

---

## 🗄️ Database Schema (Core Models)

### User
```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  name             String?
  plan             Plan      @default(FREE)  // FREE, PRO, ENTERPRISE
  stripeCustomerId String?
  projects         Project[]
  brandKits        BrandKit[]
  components       Component[] @relation("CreatedComponents")
}
```

### Project
```prisma
model Project {
  id             String        @id @default(uuid())
  userId         String
  brandKitId     String?
  title          String
  status         ProjectStatus @default(DRAFT)  // DRAFT, GENERATING, READY, EDITING, EXPORTED

  // Pipeline
  inputContent   String?       // Raw text/doc
  parsedContent  Json?         // Structured extraction from Claude
  slideBlueprint Json?         // [{componentId, data, position}]

  // Outputs
  pptxUrl        String?
  thumbnails     Json?

  // Editing
  chatHistory    Json?
  editHistory    Json?

  slides         Slide[]
}
```

### Component (THE KEY MODEL)
```prisma
model Component {
  id           String   @id @default(uuid())

  // Metadata
  name         String
  description  String
  category     ComponentCategory  // TITLE, NARRATIVE, DATA, COMPARISON, PROCESS, FRAMEWORK, VISUAL, TABLE, CLOSING
  tags         String[]

  // Visual
  thumbnailUrl String?
  previewData  Json?

  // Rendering (PptxGenJS code)
  renderCode   String   @db.Text  // JavaScript function
  dataSchema   Json                // Expected input shape (JSON Schema)

  // Provenance
  source       ComponentSource     // CORE, USER_UPLOAD, AI_GENERATED, COMMUNITY
  createdBy    String?             // userId
  extractedFrom String?            // projectId

  // Sharing
  isPublic     Boolean  @default(true)
  popularity   Int      @default(0)  // Usage count

  // AI Matching
  useCases     String[]
  bestFor      String

  slides       Slide[]
}
```

### Slide
```prisma
model Slide {
  id          String   @id @default(uuid())
  projectId   String
  position    Int
  componentId String
  data        Json      // Data fed to component
  imageUrls   Json?     // AI-generated images
  notes       String?   // Speaker notes
}
```

### BrandKit
```prisma
model BrandKit {
  id        String   @id @default(uuid())
  userId    String
  name      String
  colors    Json     // {primary, secondary, accent, text, bg}
  fonts     Json     // {heading, body}
  logoUrl   String?
  tone      String?  // formal, friendly, technical, executive
  projects  Project[]
}
```

**Full schema**: See plan file for ComponentExtraction model and enums

---

## 🤖 AI Pipeline: Content → Slides

### Flow: 4 Steps

```
User Input → [1] Parser → [2] Mapper → [3] Renderer → PPTX Output
```

### 1. Content Parser (Claude Sonnet)
**Input**: Raw text/doc + parameters (tone, audience, style, slideCount, focus)

**Output**: Structured JSON
```json
{
  "title": "Presentation title",
  "sections": [
    {
      "title": "Section name",
      "type": "data|narrative|framework|timeline|comparison",
      "content": "Main text",
      "dataPoints": [{"label": "Revenue", "value": "2.5M", "change": "+35%"}],
      "priority": 1-5
    }
  ]
}
```

### 2. Component Mapper (Claude Sonnet)
**Input**: Parsed content + component library + user preferences

**Output**: Slide blueprint
```json
[
  {
    "position": 0,
    "componentId": "cover-stats",
    "data": {
      "title": "Q4 Performance Review",
      "stats": [{"label": "Revenue", "value": "$2.5M"}]
    },
    "reasoning": "Strong opening with key metrics"
  }
]
```

### 3. Renderer (PptxGenJS)
**Process**:
1. Load component render functions from database
2. For each slide: validate data → execute renderCode in sandbox → catch errors
3. Generate PPTX buffer
4. Upload to Supabase Storage
5. Generate thumbnails (optional, V2)

**Performance Target**: <15 seconds for 20-slide deck

---

## 📦 30 Seed Components (Hand-Coded)

### TITLE (5 components)
1. `cover-stats` - Title + 3-4 key metrics in circles
2. `cover-minimal` - Clean title + subtitle + logo
3. `cover-impact` - Large number + context
4. `section-divider` - Full-bleed color with section name
5. `table-of-contents` - Numbered agenda

### DATA (8 components)
6. `kpi-dashboard` - Grid of KPIs with trends
7. `hero-metric` - Single giant metric
8. `comparison-bars` - Horizontal bars
9. `chart-column` - Column chart with annotations
10. `chart-line` - Line chart with trend
11. `data-table` - Clean table
12. `scorecard-rag` - Red/amber/green status grid
13. `financial-summary` - Revenue/costs/profit

### PROCESS (5 components)
14. `timeline-horizontal` - Left-to-right milestones
15. `timeline-vertical` - Top-to-bottom timeline
16. `process-flow` - Arrows connecting steps
17. `numbered-steps` - Large numbers with descriptions
18. `funnel` - Conversion funnel

### FRAMEWORK (6 components)
19. `swot-grid` - 2x2 SWOT matrix
20. `matrix-2x2` - Generic 2x2
21. `pyramid-3level` - 3-tier pyramid
22. `three-pillars` - Three columns with icons
23. `hub-spoke` - Central idea with radiating points
24. `maturity-staircase` - Ascending levels

### COMPARISON (3 components)
25. `before-after` - Split screen
26. `pros-cons` - Two-column list
27. `feature-matrix` - Checkmark grid

### NARRATIVE (2 components)
28. `narrative-full` - Title + body text
29. `quote-pullout` - Large quote with attribution

### CLOSING (1 component)
30. `closing-thanks` - Thank you + contact info

**Component Render Format**:
```javascript
function render(slide, data, brand) {
  // data = validated against dataSchema
  // brand = {colors, fonts, logoData}

  slide.addText(data.title, {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 32, bold: true,
    color: brand.colors.text,
    fontFace: brand.fonts.heading
  });

  // ... more PptxGenJS code
}
```

---

## 🚀 MVP Feature Set (24-Hour Build)

### ✅ In Scope (V1)
1. Next.js scaffold + Shadcn UI
2. Supabase auth (email + Google)
3. Database schema + migrations
4. Seed 30 hand-coded components
5. Project creation form
6. Content input (textarea + parameters)
7. AI parser + mapper (Claude API)
8. PPTX renderer (PptxGenJS)
9. Download button
10. Component library page
11. Component extraction (upload PPTX → extract → add to library)
12. AI component generator (describe → generate → add)
13. Chat-based editor ("swap slide 3", "add SWOT after 5")
14. Brand kit creation
15. Stripe checkout + webhook
16. Landing page
17. Rate limiting (3 decks/month free)
18. Vercel deployment

### ❌ Out of Scope (V1)
- Thumbnail generation (placeholders only)
- PDF preview (PPTX only)
- Advanced editor UI (chat is enough)
- Component ratings (usage tracking only)
- Team collaboration
- API access
- Image generation (Week 2)
- Undo/redo UI

---

## 📁 File Structure

```
deckforge/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (marketing)/
│   │   │   ├── page.tsx              # Landing
│   │   │   └── pricing/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Project list
│   │   │   ├── new/page.tsx          # New project form
│   │   │   ├── projects/[id]/page.tsx # Editor
│   │   │   ├── components/page.tsx   # Component library
│   │   │   └── brand-kits/page.tsx
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── create/route.ts
│   │   │   │   ├── [id]/generate/route.ts
│   │   │   │   ├── [id]/edit/route.ts
│   │   │   │   └── [id]/download/route.ts
│   │   │   ├── components/
│   │   │   │   ├── list/route.ts
│   │   │   │   ├── generate/route.ts
│   │   │   │   └── extract/route.ts
│   │   │   ├── brand-kits/create/route.ts
│   │   │   └── stripe/
│   │   │       ├── checkout/route.ts
│   │   │       └── webhook/route.ts
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── parser.ts
│   │   │   ├── mapper.ts
│   │   │   ├── editor.ts
│   │   │   ├── component-generator.ts
│   │   │   └── prompts.ts
│   │   ├── components/
│   │   │   ├── renderer.ts
│   │   │   ├── validator.ts
│   │   │   ├── extractor.ts
│   │   │   └── seed-data.ts
│   │   ├── db/prisma.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── storage.ts
│   │   └── utils/file-parser.ts
│   └── components/
│       ├── ui/               # Shadcn
│       ├── ProjectCard.tsx
│       ├── ComponentCard.tsx
│       ├── ChatEditor.tsx
│       └── SlideList.tsx
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── .env.local
├── package.json
└── vercel.json
```

---

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://deckforge.vercel.app
```

---

## 📋 Implementation Sequence (22 hours)

1. **Scaffold** (30 min): Next.js + Shadcn + Prisma
2. **Database** (30 min): Schema + migrations + seed script
3. **Components** (4 hours): Hand-code 30 seed components
4. **AI Pipeline** (3 hours): Parser + mapper + renderer
5. **API Routes** (3 hours): Generate, edit, download, components
6. **UI** (6 hours): Landing, dashboard, new project, editor, components
7. **Stripe** (1 hour): Checkout + webhook
8. **Extraction** (2 hours): PPTX → components
9. **Generation** (1 hour): Description → component
10. **Deploy** (1 hour): Vercel + testing

**Total**: ~22 hours (2 hours buffer)

---

## ✅ Success Criteria (Must Work for V1)

1. ✅ 30 seed components render correctly in PowerPoint
2. ✅ AI mapper selects appropriate components 70%+ accuracy
3. ✅ Generation completes in <20 seconds for 20-slide deck
4. ✅ PPTX compatible with PowerPoint, Google Slides, Keynote
5. ✅ Auth and RLS working (no security holes)
6. ✅ Stripe checkout and webhooks functional

---

## 🗺️ Post-Launch Roadmap

### Week 2: Image Generation
- Replicate integration (Flux/SDXL)
- Generate images from slide content

### Week 3: Advanced Editing
- Thumbnail generation
- Visual slide editor
- Drag-and-drop reordering

### Week 4: Analytics
- Track component usage
- User behavior tracking
- A/B test landing page

### Month 2: Data Integration (Phase 2)
- Connect Google Sheets
- Ethiopia government datasets
- API for external data sources

### Month 3: Collaboration
- Team workspaces
- Shared brand kits
- Real-time editing

### Month 6: Full Consulting Platform
- Research tools
- Report generation (Word docs)
- Client portals

---

## 💡 Why This Will Work

### 1. Self-Expanding Moat
- Every deck adds components → library grows → more valuable
- Network effects: More users = better components = more users
- Competitors can't replicate a 500+ component library

### 2. Real Pain Point
- Consultants spend 40-60% time on decks ($2K+ per deck in time)
- Pays for itself after 1 deck

### 3. Viral Loop
- Decks get shared → Recipients see "Made with DeckForge" → They sign up → Repeat

### 4. Differentiated AI Use
- Most tools: AI generates text (low quality)
- DeckForge: AI SELECTS components (high quality, deterministic)

### 5. Expansion Path
- Phase 1: Visual generation (decks)
- Phase 2: Data integration (live dashboards)
- Phase 3: Research tools (market data)
- Phase 4: Full consulting OS

---

## 📊 Revenue Projections

| Month | Signups | Conversion | MRR |
|-------|---------|-----------|-----|
| 1 | 100 | 5% | $145 |
| 3 | 500 | 10% | $1,450 |
| 6 | 2,000 | 15% | $8,700 |
| 12 | 10,000 | 20% | $58,000 |

---

## 🔒 Security Considerations

- **Auth**: Supabase Auth with Row Level Security (RLS)
- **Data**: RLS on all tables, API routes check auth
- **File uploads**: Type, size, content validation
- **Render code**: Server-side sandboxed VM (vm2 library, 5s timeout)
- **Rate limiting**: Free=3 decks/month, Pro=unlimited, Enterprise=unlimited

---

## 📝 Next Session Checklist

Before starting implementation:
- [ ] Create Supabase project (get URL + keys)
- [ ] Get Anthropic API key
- [ ] Create Stripe account (test mode)
- [ ] Create GitHub repo
- [ ] Create Vercel account
- [ ] Add all env vars to `.env.local`

Then start building in this order:
1. Scaffold Next.js project
2. Setup database
3. Seed components
4. Build AI pipeline
5. Create UI pages
6. Deploy to Vercel

---

---

## 🔧 WAT Framework Integration

DeckForge follows the **WAT Architecture** (Workflows, Agents, Tools):

### Layer 1: Workflows (Instructions)
Markdown SOPs stored in `workflows/deckforge/`:
- `generate_deck.md` - Main pipeline: content → AI → PPTX
- `extract_components.md` - PPTX upload → component extraction
- `ai_component_generation.md` - Description → render code
- `chat_editing.md` - User command → deck modification
- `stripe_checkout.md` - Subscription flow

Each workflow defines:
- Objective
- Required inputs
- Which tools/scripts to use
- Expected outputs
- Edge cases and error handling

### Layer 2: Agent (Decision-Maker)
Claude's role:
- Read relevant workflow
- Run tools in correct sequence
- Handle failures gracefully
- Ask clarifying questions when needed
- Connect intent to execution without doing everything directly

### Layer 3: Tools (Execution)
Deterministic scripts that do the actual work:
- `/src/lib/ai/parser.ts` - Claude API content parsing
- `/src/lib/ai/mapper.ts` - Component selection logic
- `/src/lib/components/renderer.ts` - PptxGenJS execution
- `/src/lib/components/extractor.ts` - PPTX XML parsing
- `/src/lib/components/validator.ts` - Data schema validation
- Prisma migrations - Database schema changes
- Seed scripts - Component population

### Why This Matters
When AI tries to handle every step directly, accuracy drops fast (90%^5 = 59% after 5 steps). By offloading execution to deterministic scripts, we stay focused on orchestration and decision-making where we excel.

---

## 🔄 Self-Improvement Loop

Every failure during development is a chance to make the system stronger:

### The Loop
1. **Identify what broke** - Read error messages, trace failures
2. **Fix the tool** - Update the script, not just work around it
3. **Verify the fix works** - Test end-to-end
4. **Update the workflow** - Document the new approach so it never happens again
5. **Move on** - With a more robust system

### Examples in DeckForge Context

**Scenario 1: AI Mapper Selects Wrong Component**
1. Identify: Log shows "selected data-table for narrative content"
2. Fix: Update `mapper.ts` prompt to better distinguish content types
3. Verify: Test with same input, verify correct component chosen
4. Update: Document in `workflows/deckforge/generate_deck.md` - "If narrative content misclassified, check for these keywords..."
5. Move on: Next deck generation uses improved logic

**Scenario 2: PPTX Rendering Fails on Specific Component**
1. Identify: Component `swot-grid` throws error with 5+ items
2. Fix: Update `seed-data.ts` render function to handle variable item counts
3. Verify: Test with 3, 5, 8 items - all render correctly
4. Update: Add to workflow - "All components must handle 1-N items"
5. Move on: Component now robust for all data sizes

**Scenario 3: Rate Limiting Breaks Generation**
1. Identify: Claude API returns 429 after 50 requests
2. Fix: Add exponential backoff to `parser.ts` and `mapper.ts`
3. Verify: Simulate rate limit, confirm retry logic works
4. Update: Document in workflow - "Parser has built-in retry with 2s/4s/8s backoff"
5. Move on: Production-ready rate limit handling

### Documentation Guidelines

**When to Update Workflows**:
- Found a better method ✅
- Discovered a constraint (rate limits, API quirks) ✅
- Encountered a recurring issue ✅
- Learned an optimization ✅

**When NOT to Update**:
- One-off bugs (fix and move on) ❌
- Temporary workarounds (don't codify hacks) ❌
- Unverified theories (test first) ❌

**Don't create or overwrite workflows without asking** - these are instructions that need to be preserved and refined, not tossed after one use.

---

## 📂 Workflow Storage Structure

```
workflows/
└── deckforge/
    ├── 01_setup.md                    # Initial project scaffold
    ├── 02_database_setup.md           # Supabase + Prisma configuration
    ├── 03_seed_components.md          # Hand-coding 30 components
    ├── 04_generate_deck.md            # Main pipeline
    ├── 05_extract_components.md       # PPTX → component library
    ├── 06_ai_component_generation.md  # Description → code
    ├── 07_chat_editing.md             # User edits via chat
    ├── 08_stripe_integration.md       # Subscription flow
    ├── 09_deployment.md               # Vercel + production setup
    └── 99_troubleshooting.md          # Common issues + fixes
```

Each workflow created during development based on what we learn.

---

## 🎓 Learning Principles

### Stay Pragmatic
- Don't over-engineer
- Fix the immediate problem, then generalize if it recurs
- Simple solutions > complex abstractions

### Stay Reliable
- Test fixes before documenting them
- Validate assumptions with real data
- Sandbox dangerous operations (render code execution)

### Keep Learning
- Every error teaches something
- Document patterns, not just solutions
- Build institutional knowledge in workflows

### Bottom Line
Claude sits between **what you want** (workflows) and **what actually gets done** (tools). The job is to:
- Read instructions
- Make smart decisions
- Call the right tools
- Recover from errors
- Keep improving the system as we go

---

---

## 🚀 SESSION PROGRESS (Feb 22, 2026 - 6 hours completed)

### ✅ COMPLETED
1. **Scaffold** - Next.js 14 + TypeScript + Tailwind + all deps
2. **Database** - Supabase tables created, Prisma configured
3. **Components** - 18/30 core components implemented
4. **AI Pipeline** - Parser + Mapper + Renderer complete
5. **API** - `/api/projects/generate` route working
6. **Seed** - Database seed script ready

### 📋 NEXT SESSION START HERE

**Run first** (populate database):
```bash
cd deckforge
npm run db:seed
```

**Then build** (in order):
1. Create remaining API routes (`/api/projects/[id]/download`, etc.)
2. Build landing page (`/`)
3. Build dashboard (`/dashboard`)
4. Build new project form (`/dashboard/new`)
5. Deploy to Vercel

**Key files**:
- `app/api/projects/generate/route.ts` ✅
- `lib/components/seed-data.ts` (18 components)
- `lib/ai/parser.ts` ✅
- `lib/ai/mapper.ts` ✅
- `lib/components/renderer.ts` ✅

**Time**: 6h done, ~14h remaining to MVP

---

**Full detailed plan**: `C:\Users\HP\.claude\plans\parsed-rolling-pascal.md`
**Current session plan**: `C:\Users\HP\.claude\plans\hidden-bubbling-frost.md`
**Node.js version**: v24.13.1 ✅
**Architecture**: WAT Framework (Workflows, Agents, Tools)
