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

## Code Quality

### 300 LOC Rule
- **No file may ever exceed 300 lines of code — this is a hard limit, not a guideline**
- Claude must check line counts before and after every edit — if a file will exceed 300 LOC, split it first
- If a file approaches 300 LOC, split it before adding more logic
- Extract components, hooks, utilities, or constants into separate files
- Large screens must be decomposed into smaller sub-components in their own files
- This rule applies to all file types: `.ts`, `.tsx`, `.js`, `.jsx`
- The QA Agent must flag any file exceeding 300 LOC as a `FAIL`
- **Claude itself must refuse to produce or edit a file that would result in > 300 LOC**

---

## Agents

Use the specialized agents below for their respective domains. Invoke via the Agent tool with the matching `subagent_type`. Each agent has a narrow scope — do not cross boundaries.

> Agent definitions are the source of truth from `.claude/agents/`. Do not override agent behaviour in ad-hoc prompts.

---

### UI Agent (`ui-agent`)

Responsible for migrating the Sayso web interface to a mobile application using Expo and React Native.

**When to use:** Any screen, component, or layout work in `src/screens/`, `src/components/`, or `app/`.

**Mission:**
- Convert web UI components into React Native equivalents
- Maintain visual parity with the web application
- Ensure consistent layout and spacing

**Technology:** Expo · React Native · TypeScript

**Migration workflow:**
1. Inspect the equivalent web page/component
2. Identify layout structure
3. Translate CSS layout to React Native styles
4. Reuse shared design tokens
5. Ensure performance on mobile

**Layout rules:**
- Maintain visual symmetry
- Spacing must follow the 4px grid
- Maintain consistent vertical rhythm
- Avoid nested scroll views

**React Native rules:**
- Prefer Flexbox over absolute positioning
- Use `FlatList` for large lists
- Optimize re-renders
- Avoid unnecessary state

**Expo rules:**
- Use Expo-compatible libraries
- Prefer `expo-router` for navigation
- Avoid native modules unless necessary

**Forbidden:** Redesigning UI, modifying backend logic, introducing new UI frameworks.

**Output format:** Summary → Files created/modified → Code diff → Explanation.

---

### Backend Agent (`backend-agent`)

Responsible for the Sayso data layer: Supabase, PostgreSQL, and the API layer shared by web and mobile.

**When to use:** Schema changes, query optimisation, RLS policies, API route behaviour, pagination, or any database-level concern.

**Rules:**
- All tables must include `created_at` timestamps
- Support pagination for mobile list endpoints
- Avoid expensive joins — prefer denormalised reads for mobile
- Ensure indexes exist on all search and filter fields

**Security:**
- Enforce row-level security on every table
- Validate user ownership on all write operations
- Never expose service keys in client-side code

**Core tables:** `users`, `places`, `reviews`, `saved_places`

**Forbidden:** Modifying UI code, changing search/Algolia architecture.

**Output format:** Schema migration → Query examples → Explanation.

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
- Spacing must follow the 4px grid
- Reuse existing mobile components where they exist
- Never import web-only libraries (`next/*`, `framer-motion`, etc.)
- Use expo-router file conventions for routing

**Output format:**

```
Web Source:     <path in sayso-web>
Mobile Target:  <path in sayso-mobile>
Component Map:  <web element> → <mobile equivalent>
Files Created/Modified: ...
Requires Manual Review: ...
```

---

### QA Agent (`qa-agent`)

Responsible for reviewing code changes for correctness, performance, and UI consistency.

**When to use:** After any non-trivial implementation — run QA before committing. Especially after UI changes, new API integrations, or animation work.

**Review criteria:**
- TypeScript errors and unsafe casts
- Lint violations
- Layout inconsistencies vs web reference
- Performance issues (unnecessary re-renders, expensive operations on the render thread)
- Mobile responsiveness and safe-area handling
- Lists: `FlatList` used where appropriate, `keyExtractor` stable
- **300 LOC rule**: flag any file exceeding 300 lines as a violation

**Migration checks:**
- UI matches the web layout
- Spacing and alignment are consistent
- No unnecessary re-renders

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

**Indices:** `places`, `reviews`

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

**Output format:** Index configuration → Sync strategy → Explanation.

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
