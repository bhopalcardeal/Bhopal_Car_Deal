# Used Car Marketplace — Antigravity Build Prompts (Phase by Phase)

## How this works

1. Paste **Prompt 0** into Antigravity first. It sets up the project, the tech
   stack, and — critically — a `PROGRESS.md` file convention that every
   later prompt requires the AI to read before starting and update before
   finishing.
2. Then paste each phase's prompt **in order**, one at a time. Don't skip
   ahead — each prompt tells the AI to read `PROGRESS.md` first, so it
   always knows what already exists.
3. After each phase, open `PROGRESS.md` yourself and check it against what
   was actually built. That file is your verification layer — it's written
   *for you*, not just for the AI's own memory.
4. If something's wrong or incomplete, your next message to Antigravity can
   just be: *"PROGRESS.md says X is done but it isn't — fix before moving
   on."*

Every prompt below follows the same shape on purpose: **Context → Task →
Constraints → Definition of Done → Update PROGRESS.md**. Keep that shape if
you add your own prompts later — it's what makes the AI's self-reporting
reliable instead of vague.

---

## PROMPT 0 — Project Setup & Progress-Tracking Convention

```
You are building a premium, production-grade Next.js web application: a
pre-owned car buying/selling marketplace (dealership model), based on the
attached PRD (reference site: elitecarz.in).

TECH STACK (do not deviate without asking):
- Next.js 15, App Router, TypeScript, strict mode
- Tailwind CSS v4
- shadcn/ui for headless/base components, Vengeance UI for premium
  animated public-site sections (hero, marquee, cards)
- motion (Framer Motion successor, import from "motion/react") for all
  animation — prefer transform/opacity only, no layout-thrashing animations
- Zustand for client state, TanStack Query for server state
- react-hook-form + zod for all forms
- Prisma + PostgreSQL
- next/image for all images, no raw <img> tags

TASK — initial setup:
1. Scaffold the Next.js project with the above stack installed and configured
   (Tailwind, shadcn init, ESLint, Prettier, strict TS config).
2. Create the folder structure:
   app/(public)/, app/(admin)/, components/ui/, components/premium/,
   components/forms/, components/admin/, lib/db.ts, lib/validations/,
   lib/motion/, prisma/schema.prisma
3. Add a root README.md summarizing the stack and how to run the project.
4. Create a file called PROGRESS.md at the project root with this exact
   structure, and keep using this structure for the rest of the project:

   # Project Progress Log

   ## Phase 0 — Setup
   - Status: [Done / In Progress / Blocked]
   - What was built: (bullet list, be specific — file paths, not vague claims)
   - What was NOT built / deferred: (bullet list)
   - Known issues or shortcuts taken: (bullet list, be honest — do not hide
     incomplete work)
   - Files created or modified: (list of paths)
   - Next recommended step:

   Each future phase gets appended as its own `## Phase N — <name>` section
   in the SAME file. Never overwrite earlier phase entries — always append.

CONSTRAINT: Do not build any pages or business logic yet — this prompt is
setup only.

DEFINITION OF DONE:
- Project builds and runs with `npm run dev` with no errors
- Tailwind + shadcn confirmed working with one test component rendered on
  the homepage placeholder
- PROGRESS.md exists with the Phase 0 section filled in truthfully

Before you finish, update PROGRESS.md's Phase 0 section per the structure
above. Be precise and honest about what is and isn't working — this file is
what I will check against your actual output.
```

---

## PROMPT 1 — Design System & Shared Animation Primitives

```
Read PROGRESS.md before starting. Confirm Phase 0 is actually Done by
briefly checking the files it claims exist — if something it claims is
missing, note that in your Phase 1 log instead of silently redoing it.

TASK:
1. Install and configure the shadcn/ui base components we'll need across
   the app: Button, Input, Select, Slider, Dialog, Sheet, Skeleton, Table,
   Badge, Card, Tabs, Accordion, Form.
2. Pull in the Vengeance UI components needed for the public-site hero,
   testimonial marquee, and premium card treatments (list exactly which
   Vengeance components you install and why).
3. Create lib/motion/variants.ts with shared, reusable motion variants:
   fadeUp, staggerContainer, scaleIn, slideInFromRight — typed, documented
   with a one-line comment on when to use each.
4. Define the design tokens in Tailwind config: color palette (accent color
   + neutral backgrounds, per the PRD's "clean, trust-driven" brief), type
   scale, spacing scale. Pick one accent color and justify it in one
   sentence in PROGRESS.md.
5. Build a single /style-guide route (dev-only) that renders every base
   component and every motion variant so we can visually sanity-check them
   before building real pages.

CONSTRAINT: No real app pages yet. This is the design system only.

DEFINITION OF DONE: /style-guide renders without errors and visibly shows
every component and animation variant in action.

Append a "## Phase 1 — Design System" section to PROGRESS.md following the
same structure as Phase 0. List every component/library installed, every
file created, and explicitly flag anything you skipped or approximated.
```

---

## PROMPT 2 — Data Model & Prisma Schema

```
Read PROGRESS.md before starting.

TASK: Implement prisma/schema.prisma covering these entities from the PRD:
CarListing, SellerLead, BuyerEnquiry, AdminUser, Banner, Testimonial, FAQ,
StaticPage — with the fields listed in PRD Section 8 (car specs, seller
lead fields, enquiry fields, etc.). Add sensible indexes (status, brand,
price, created_at) since browse/filter performance depends on this.

Also:
1. Write a seed script (prisma/seed.ts) with ~20 realistic fake car
   listings (varied brands, prices, years) and a few sample leads/enquiries/
   testimonials, so later phases have real data to render against.
2. Set up lib/db.ts as the singleton Prisma client for Next.js.

CONSTRAINT: Registration numbers and seller/buyer contact info fields must
be modeled but never exposed by any public-facing query — note in
PROGRESS.md exactly which fields are admin-only and how that's enforced
(e.g. explicit `select` in public queries, not just "trust the frontend").

DEFINITION OF DONE: `npx prisma migrate dev` runs clean, `npx prisma db seed`
populates real rows, and you can query them from a Node script.

Append "## Phase 2 — Data Model" to PROGRESS.md: schema summary, seed data
counts, and explicitly state which fields are public vs admin-only.
```

---

## PROMPT 3 — Public Home Page

```
Read PROGRESS.md before starting — use the design tokens and motion
variants from Phase 1, don't reinvent them.

TASK: Build app/(public)/page.tsx (Home) as a Server Component with:
- Hero section (Vengeance UI hero block, motion parallax on hero image)
- Trust/USP section — scroll-reveal, staggered entrance using
  staggerContainer variant from Phase 1
- Featured cars grid (query top N "is_featured" listings from Prisma
  server-side — no client fetch for this)
- New Arrivals section
- Testimonials marquee (Vengeance UI)
- FAQ accordion (shadcn Accordion)
- Footer with policy links (can be placeholder pages for now)

PERFORMANCE CONSTRAINTS:
- This page must be a Server Component by default; only the marquee/motion
  pieces that truly need interactivity should be "use client"
- Hero image must use next/image with priority + explicit sizes
- Report the Lighthouse performance score you'd expect and why (or run it
  if you have the tooling)

DEFINITION OF DONE: Home page renders real seeded data, hero animates on
load, testimonials scroll, no console errors, no layout shift on image load.

Append "## Phase 3 — Home Page" to PROGRESS.md: what renders, what's still
placeholder (e.g. real testimonials vs seed data), any perf numbers you
checked, and anything not done.
```

---

## PROMPT 4 — Browse/Listing Page (Filters + Search)

```
Read PROGRESS.md before starting.

TASK: Build app/(public)/cars/page.tsx:
- Server-rendered initial grid using searchParams for filters (brand,
  price range, year range, fuel type, transmission, km driven, RTO state,
  body type) — read PRD Section 5.1.2 for the exact filter list
- Client-side filter UI (sidebar or drawer on mobile) using Zustand for
  local filter state, syncing to the URL searchParams so filtered views
  are shareable/bookmarkable
- Sorting: price, year, recently added, km driven
- Card entrance animation using `motion` with the `layout` prop so
  re-filtering reflows smoothly instead of jump-cutting
- Skeleton loading state (shadcn Skeleton) during filter transitions
- Pagination or infinite scroll (pick one, state which and why)
- "Sold" cars excluded from default results but included if a "show sold"
  toggle is on (per PRD)

DEFINITION OF DONE: Filtering, sorting, and pagination all work against
real seeded data with no full-page reload, and the URL reflects filter
state.

Append "## Phase 4 — Browse Page" to PROGRESS.md: which filters are fully
wired vs stubbed, sorting/pagination approach chosen, and any performance
concerns noticed with the current seed data size.
```

---

## PROMPT 5 — Car Detail Page

```
Read PROGRESS.md before starting.

TASK: Build app/(public)/cars/[slug]/page.tsx as an ISR page
(revalidate: 300) with:
- Image gallery with drag/swipe (motion) + lightbox on click
- Title, price, discount badge/strikethrough if applicable, starting EMI
- Full spec table (per PRD 3.2 / 5.1.3 field list)
- "Special about this car" tags
- Interactive EMI calculator: client component, debounced slider inputs,
  animated number roll-up on value change (motion's animate()/useSpring)
- Trust badges (warranty, RC transfer, inspection checkpoints)
- Enquiry actions: Call Now, Enquire Now (opens a lead form modal), WhatsApp
  click-to-chat link
- Related cars section (same brand/body-type/price-range query)
- Generate proper metadata (title, description, OG image) per car for SEO

DEFINITION OF DONE: Page loads a real seeded car by slug, EMI calculator
computes correctly and animates, enquiry modal opens and (for now) logs
submitted data to console if the enquiry API isn't built yet — note that
clearly if so.

Append "## Phase 5 — Car Detail Page" to PROGRESS.md: what's live vs
stubbed (especially whether enquiry submission actually persists yet),
and confirm SEO metadata is present.
```

---

## PROMPT 6 — Sell Your Car (Multi-Step Lead Form)

```
Read PROGRESS.md before starting.

TASK: Build app/(public)/sell-your-car/page.tsx as a multi-step wizard:
Step 1: Contact (name, mobile, WhatsApp, city)
Step 2: Registration (reg number, reg state dropdown, manufacturing year,
registration year, owner type)
Step 3: Vehicle (brand, model, variant, km driven range, fuel type,
transmission)
Step 4: Price (expected price) + optional photo upload (3-5 images)

Use react-hook-form + zod, one schema per step, validated before advancing.
Persist in-progress form state in Zustand so back/forward doesn't lose data.
Animate step transitions with AnimatePresence.
On final submit: create a SellerLead row via a server action, show a
confirmation screen.
Add basic spam protection (rate limiting or a honeypot field — note which
you used; full CAPTCHA integration can be a later phase).

DEFINITION OF DONE: Submitting the form all the way through creates a real
row in the database, visible via a Prisma Studio check or a quick admin
query.

Append "## Phase 6 — Sell Your Car Form" to PROGRESS.md: confirm the lead
actually persists to the DB (not just console-logged), what spam
protection is in place vs deferred, and photo upload status.
```

---

## PROMPT 7 — Admin Auth & Dashboard Shell

```
Read PROGRESS.md before starting.

TASK:
1. Set up NextAuth credentials-based login for the admin panel at
   app/(admin)/admin/login. Passwords hashed (bcrypt/argon2). Note whether
   2FA is implemented now or deferred to a later phase.
2. Protect all app/(admin)/admin/** routes with middleware — unauthenticated
   requests redirect to login.
3. Build the dashboard shell (app/(admin)/admin/dashboard/page.tsx) with
   summary cards: total live listings, cars sold this month, new seller
   leads, new buyer enquiries — pulled from real Prisma counts.
4. Basic charts (Recharts): listings by status, leads by source.

DEFINITION OF DONE: Logging in with a seeded admin user works, visiting
/admin/dashboard while logged out redirects to login, and the dashboard
shows real counts from the seeded data.

Append "## Phase 7 — Admin Auth & Dashboard" to PROGRESS.md: confirm auth
is actually enforced (not just UI-hidden), whether 2FA is done or deferred,
and which dashboard numbers are real vs placeholder.
```

---

## PROMPT 8 — Admin Inventory Management (CRUD)

```
Read PROGRESS.md before starting.

TASK: Build app/(admin)/admin/inventory/ with:
- List view (TanStack Table): sortable/filterable by status, brand, price
- Add/Edit car form (react-hook-form + zod) covering the full CarListing
  schema, multi-image upload with drag-to-reorder and a designated cover
  image
- Set base price + optional discounted price with auto "% off" calculation
- Status control: Draft / Published / Reserved / Sold / Archived
- Bulk actions: bulk publish/unpublish, bulk delete, bulk price update
- "Duplicate listing" action
- Featured / New Arrival toggles, custom highlight tags input

DEFINITION OF DONE: An admin can create a car from scratch, it appears
correctly on the public browse and detail pages, editing it updates the
public pages (respecting ISR revalidation), and deleting/archiving removes
it from public listings.

Append "## Phase 8 — Inventory CRUD" to PROGRESS.md: confirm the full
create → public page → edit → public page loop actually works end to end,
list any CRUD actions that are UI-only and not wired to the database yet.
```

---

## PROMPT 9 — Admin Leads & Enquiries Management

```
Read PROGRESS.md before starting.

TASK: Build:
1. app/(admin)/admin/leads/ — seller leads table + detail view, status
   workflow (New → Contacted → Inspection Scheduled → Evaluated/Offer Made
   → Purchased → Rejected/Closed), internal notes field, and a "Convert to
   inventory listing" action that pre-fills the Add Car form from lead data.
2. app/(admin)/admin/enquiries/ — buyer enquiries table + detail view,
   status workflow (New → Contacted → Test Drive Scheduled → Negotiation →
   Won/Sold → Lost), linked back to the source car.
3. CSV export for both tables.

DEFINITION OF DONE: Status changes persist, the "convert lead to listing"
action actually creates a real CarListing pre-filled with lead data (not
just navigating to a blank form), and CSV export downloads real data.

Append "## Phase 9 — Leads & Enquiries" to PROGRESS.md: confirm the
lead-to-listing conversion is genuinely pre-filled and not just a blank
redirect, and note CSV export status.
```

---

## PROMPT 10 — Notifications & Third-Party Integrations

```
Read PROGRESS.md before starting.

TASK:
1. Wire up email notifications (SendGrid/SES or a dev-mode console
   fallback if no API key is configured yet — be explicit about which)
   for: new seller lead, new buyer enquiry, seller/buyer confirmation on
   submission.
2. Add WhatsApp click-to-chat links (car detail, contact page, sticky
   mobile button) — this doesn't need the full Business API, just a
   wa.me link with a pre-filled message.
3. Add Google reCAPTCHA (or equivalent) to the Sell Your Car and Contact
   forms.
4. Add Google Analytics / basic pageview tracking.

DEFINITION OF DONE: Submitting a lead/enquiry actually triggers a real (or
clearly-labeled dev-mode) notification, and reCAPTCHA blocks obviously
automated submissions.

Append "## Phase 10 — Notifications & Integrations" to PROGRESS.md: which
integrations are live with real credentials vs stubbed for dev, and what
you'd need from me (API keys, business account access) to make each one
fully live.
```

---

## PROMPT 11 — Performance & SEO Pass

```
Read PROGRESS.md before starting.

TASK: Audit and fix, across the whole public site:
- Confirm Server Components are used by default and "use client" is only
  on genuinely interactive leaves
- Confirm all images use next/image with correct sizes, no layout shift
- Confirm ISR/SSG is actually in effect on listing and detail pages (not
  accidentally forced dynamic)
- Add proper metadata, sitemap.xml, robots.txt, and schema.org
  Vehicle/Product structured data on car detail pages
- Run a Lighthouse/PageSpeed pass (or your best equivalent check) and
  report real scores, not estimates, for Home, Browse, and one Car Detail
  page

DEFINITION OF DONE: You have actual performance numbers to report, not
assumptions, and any score below ~90 has a documented reason and either a
fix or a flagged tradeoff.

Append "## Phase 11 — Performance & SEO" to PROGRESS.md with the actual
scores and structured data confirmation.
```

---

## PROMPT 12 — QA, Accessibility, Final Polish

```
Read PROGRESS.md before starting.

TASK:
1. Keyboard-navigate the entire public site and admin panel — fix any
   focus traps or unreachable interactive elements.
2. Confirm alt text on all images, sufficient color contrast on the chosen
   accent palette (WCAG 2.1 AA), and that all form fields have associated
   labels.
3. Test the full flow end to end: browse → filter → view car → submit
   enquiry → admin sees it → admin changes status. Also: submit sell-car
   form → admin sees lead → converts to listing → listing appears publicly.
4. Cross-browser/device sanity check note (latest Chrome/Safari/Edge/
   Firefox, iOS/Android) — flag anything you can't verify directly.

DEFINITION OF DONE: Both end-to-end flows above work without manual
database intervention, and accessibility issues found are either fixed or
explicitly listed as known issues.

Append "## Phase 12 — QA & Accessibility" to PROGRESS.md: results of both
end-to-end flow tests, and a clear list of any remaining known issues
before launch.
```

---

## PROMPT 13 — Deployment

```
Read PROGRESS.md before starting.

TASK: Prepare for production deployment:
- Environment-based config for dev/staging/production
- Database migration strategy for production (not just `migrate dev`)
- Confirm HTTPS, secure cookie settings, rate limiting on public forms
- Deployment target setup (Vercel for frontend, or your chosen host) with
  build passing cleanly
- Automated backup note/plan for the database

DEFINITION OF DONE: A production build (`next build`) completes with no
errors or warnings you haven't explicitly accepted, and there's a written
deployment checklist.

Append a final "## Phase 13 — Deployment" section to PROGRESS.md, plus a
top-level "## Overall Status" summary listing anything from Phases 0–12
that is still not fully done, so nothing launches silently incomplete.
```

---

## Notes on using this well

- **Don't let the AI mark something "Done" on vibes.** If a phase's log
  claims something works, spend two minutes actually clicking through it
  before moving to the next prompt — catching a gap at Phase 4 is cheap;
  catching it at Phase 12 is not.
- **If a prompt's output doesn't match its Definition of Done**, your next
  message can just be that mismatch — e.g. *"PROGRESS.md Phase 5 says the
  enquiry form persists to the DB, but I checked and it doesn't — fix
  that before we move to Phase 6."*
- Feel free to split any phase across multiple days if it's too big for one
  sitting — the "read PROGRESS.md first" instruction is what makes that
  safe to do.
