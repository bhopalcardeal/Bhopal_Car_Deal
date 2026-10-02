# Bhopal Car Deal — Certified Pre-Owned Luxury Cars Showroom

A premium, production-grade web application for Bhopal Car Deal (Since 2004).

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, strict mode, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (headless accessible base components) + [Vengeance UI](https://vengeanceui.com/) (premium animated sections)
- **Animation**: [motion](https://motion.dev/) (successor to Framer Motion, imported from `motion/react`)
- **State Management**:
  - [Zustand](https://github.com/pmndrs/zustand) for client state
  - [@tanstack/react-query](https://tanstack.com/query/latest) for server state
- **Forms & Validation**: [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/)
- **Database & ORM**: [Prisma](https://www.prisma.io/) + PostgreSQL
- **Images**: `next/image` with responsive optimization and lazy loading
- **Tooling**: Strict TypeScript (`noUncheckedIndexedAccess`), ESLint (flat config), Prettier with Tailwind plugin

---

## Directory Structure

```
├── app/
│   ├── (public)/          # Public-facing storefront (Home, Browse, Car Details, Sell Car, Contact)
│   ├── (admin)/           # Admin management panel (Inventory, Leads, Enquiries, Settings)
│   ├── globals.css        # Tailwind v4 entrypoint & theme variables
│   └── layout.tsx         # Root HTML layout and typography
├── components/
│   ├── ui/                # shadcn base atomic components (Button, Input, Dialog, etc.)
│   ├── premium/           # Vengeance UI premium animated modules (Hero, Marquee, Cards)
│   ├── forms/             # Composite forms (Sell Car wizard, Enquiry modal, Contact)
│   └── admin/             # Admin panel widgets and table layouts
├── lib/
│   ├── db.ts              # Prisma client singleton
│   ├── utils.ts           # Class merging helper (clsx + tailwind-merge)
│   ├── validations/       # Zod schemas for forms and API validation
│   └── motion/            # Motion variants and animation tokens
├── prisma/
│   └── schema.prisma      # PostgreSQL schema
├── public/                # Static assets
├── PROGRESS.md            # Progress log tracking every phase
└── README.md              # Project documentation
```

---

## Getting Started

### Prerequisites
- Node.js 20+ (Node.js 22 recommended)
- npm 10+
- PostgreSQL database instance (or local Docker container)

### Installation

1. Clone repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit DATABASE_URL in .env to point to your PostgreSQL instance
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

### Quality Scripts
- **Typecheck**: `npm run typecheck`
- **Lint**: `npm run lint`
- **Format**: `npm run format` (or `npm run format:check`)
- **Build**: `npm run build`
