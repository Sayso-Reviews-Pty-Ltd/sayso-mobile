# Claude Code Rules — sayso-mobile

## Design Enforcement

### Grid Discipline
- All layout must align to an **8pt base grid** (4pt for fine adjustments)
- Padding and margin values must be multiples of 4: `4, 8, 12, 16, 20, 24, 32, 40, 48`
- No arbitrary pixel values — if it doesn't fit the grid, question the design

### Spacing Scale
- Use only these spacing values: `4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64`
- Do not invent intermediate values (e.g. no `13`, `17`, `22`, `26`)
- Gap, padding, margin, and insets must all pull from this scale

### Alignment Rules
- Text and icons must align to a consistent baseline grid
- Horizontal alignment: left-align body content, center only for hero/empty states
- Never mix alignment styles within the same list or card component
- Use `alignItems` and `justifyContent` explicitly — no relying on implicit defaults

### Component Reuse
- Before creating a new component, check if an existing one can be extended
- Do not duplicate logic — extract shared patterns into reusable components
- Shared UI lives in `src/components/` — use it, don't reinvent it
- Tokens (colors, spacing, typography) must come from the existing theme/token files

### No Creative Deviation
- Do not introduce new visual styles, color values, shadows, or decorative elements not already in the design system
- Do not add background orbs, gradients, blur effects, or decorative shapes unless explicitly requested
- Match existing component patterns exactly — no "improvements" to visual design without explicit instruction
- When in doubt, replicate what already exists elsewhere in the codebase

---

## Agents

Use the specialized agents below for their respective domains. Invoke via the Agent tool with the matching `subagent_type`. Each agent has a narrow scope — do not cross boundaries.

---

### UI Agent (`ui-agent`)

Responsible for migrating the Sayso web interface to mobile using Expo and React Native.

**When to use:** Any screen, component, or layout work in `src/screens/`, `src/components/`, or `app/`.

**Rules:**
- Inspect the equivalent web page/component before building
- Translate CSS Flexbox → React Native StyleSheet; Tailwind → style objects
- Prefer Flexbox over absolute positioning
- Use `FlatList` for large lists; avoid nested ScrollViews
- Use `expo-router` for navigation; avoid native modules unless necessary
- Reuse design tokens from `src/styles/` and `src/screens/tabs/home/HomeTokens.ts`
- No redesigning UI — replicate what exists on web
- No new UI frameworks

**Forbidden:** Modifying backend logic, introducing new visual styles not in the design system.

---

### Backend Agent (`backend-agent`)

Responsible for the Sayso data layer: Supabase, PostgreSQL, and the API layer shared by web and mobile.

**When to use:** Schema changes, query optimisation, RLS policies, API route behaviour, pagination, or any database-level concern.

**Rules:**
- All tables must include `created_at` timestamps
- Support offset-based pagination for mobile list endpoints
- Avoid expensive joins — prefer denormalised reads for mobile
- Ensure indexes exist on all search and filter fields
- Enforce row-level security on every table
- Validate user ownership on all write operations
- Never expose service keys in client-side code

**Core tables:** `users`, `businesses`, `reviews`, `events_and_specials`, `saved_places`, `profiles`

**Forbidden:** Modifying UI code, changing search/Algolia architecture.

**Output format:** schema migration → query examples → explanation.

---

### Migration Agent (`migration-agent`)

Responsible for mapping web components from `sayso-web` to their React Native equivalents in `sayso-mobile`.

**When to use:** Any task that starts with "port X from web" or "the web has Y, add it to mobile".

**Web → Mobile mapping:**

| Web | Mobile |
|-----|--------|
| Next.js page | expo-router screen |
| CSS Flexbox | React Native StyleSheet flex |
| Tailwind classes | React Native style objects |
| `next/image` | `expo-image` |
| `next/link` | expo-router `Link` |
| SWR hooks | reuse directly (web-compatible) |
| Supabase client | reuse directly (web-compatible) |
| React context | React Native context (same pattern) |

**Workflow:**
1. Receive a web path (e.g. `/app/(routes)/for-you/page.tsx`)
2. Read source from `/Users/hilarionengare/sayso-web`
3. Identify layout, data fetching, and interaction patterns
4. Produce the equivalent screen at the correct path in `sayso-mobile`
5. Flag web-only patterns that need manual review

**Rules:**
- Do not redesign — replicate
- Spacing must follow the 4pt grid
- Reuse existing mobile components where they exist
- Never import web-only libraries (`next/*`, `framer-motion`, etc.)
- Use expo-router file conventions for routing

**Output format:** Web Source → Mobile Target → Component Map → Files Created/Modified → Requires Manual Review.

---

### QA Agent (`qa-agent`)

Responsible for reviewing code changes for correctness, performance, and UI consistency.

**When to use:** After any non-trivial implementation — run QA before committing. Especially after UI changes, new API integrations, or animation work.

**Review criteria:**
- TypeScript errors and unsafe casts
- Lint violations
- Layout inconsistencies vs web reference
- Performance issues (unnecessary re-renders, missing memoisation, expensive operations on the render thread)
- Mobile responsiveness and safe-area handling
- Animation correctness (`useNativeDriver` usage, Reanimated worklet safety)
- Lists: FlatList used where appropriate, `getItemLayout` provided, `keyExtractor` stable

**Output format:**
```
Review Summary: PASS / FAIL

Issues Found:
- ...

Suggested Fixes:
- ...
```

---

### Search Agent (`search-agent`)

Responsible for search and discovery via Algolia.

**When to use:** Changes to search relevance, Algolia index configuration, geo-search behaviour, or Supabase → Algolia sync.

**Indices:** `businesses`, `reviews`

**Ranking priorities (in order):**
1. Proximity to user
2. Rating
3. Review count
4. Recency

**Rules:**
- Index only necessary fields — minimise payload size
- Keep indices synchronised with database updates
- Debounce mobile search queries before hitting Algolia

**Forbidden:** Modifying UI, modifying database schema.

**Output format:** index configuration → sync strategy → explanation.

---

### Product Agent (`product-agent`)

Responsible for translating product or migration requests into clear engineering tasks for the specialist agents above.

**When to use:** When a feature request spans multiple agents (e.g. "add events to the home screen" touches UI, backend, and search). Use the Product Agent to decompose first, then dispatch to the correct agents.

**Does NOT write application code.**

**Responsibilities:**
- Break down feature requests into discrete tasks per agent
- Coordinate web → mobile migration work
- Define acceptance criteria
- Assign tasks to the correct agents

**Migration rules:**
- Mobile UI must match web UI visually
- Avoid unnecessary redesign
- Reuse design tokens from the web project
- Prioritise functional parity

**Output format:**
```
Feature:
<description>

Migration Target:
/web/page → /mobile/screen

Tasks:
1. UI Agent → ...
2. Backend Agent → ...
3. Search Agent → ...
4. QA Agent → ...

Acceptance Criteria:
- ...
```
