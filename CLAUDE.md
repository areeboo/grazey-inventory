# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grazey Inventory is a full-stack inventory management system for charcuterie board production. Built with Next.js 14 App Router, TypeScript, MongoDB, and Tailwind CSS + DaisyUI.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint validation
npm run seed         # Seed database (tsx src/scripts/seedData.ts)
```

## Architecture

### Data Flow
```
API Route (Next.js) → Mongoose Model → MongoDB
        ↓
React Query Hook (caching, 5min stale time)
        ↓
Zustand Store (client-side filters/UI state)
        ↓
React Component
```

### Directory Structure
- `src/app/api/` - REST API routes (ingredients, recipes, orders, history, shopping-list)
- `src/app/[page]/` - Next.js pages (inventory, production, orders, boards, shopping-list, history)
- `src/components/` - React components organized by feature, plus `ui/` (reusable), `common/` (shared), `providers/`
- `src/hooks/` - Custom React Query hooks for data fetching
- `src/stores/` - Zustand stores for client state
- `src/lib/db/` - MongoDB connection and Mongoose models
- `src/lib/utils/` - Helper functions including production analysis calculations
- `src/types/` - TypeScript type definitions

### Key Models
- **Ingredient**: name, category, quantity, unit, threshold (for low stock alerts)
- **Recipe** (Board): name, category (Classic|Vegetarian|Sweet|Keto), ingredients array with quantities
- **Order**: orderNumber, recipeId, quantity, status (in-progress|completed|cancelled), debitedIngredients
- **Activity**: action type, metadata, timestamps for audit logging

### API Patterns
- CRUD routes follow `/api/[resource]/route.ts` and `/api/[resource]/[id]/route.ts` pattern
- Special endpoints: `/api/ingredients/[id]/adjust`, `/api/orders/[id]/complete`, `/api/recipes/analysis`
- All routes return consistent JSON responses with error handling

### State Management
- **Server state**: TanStack React Query v5 with query keys defined in `src/lib/queryClient.ts`
- **Client state**: Zustand for filters, modal state, and transient UI
- Query invalidation required when mutations affect production analysis

### Styling
- Tailwind CSS with custom "grazey" DaisyUI theme
- Custom colors: primary (blue), classic, vegetarian (green), sweet (amber), keto (purple)
- Path alias: `@/*` maps to `./src/*`

## Environment Variables

Required in `.env.local`:
```
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_APP_NAME=Grazey Inventory
```

## Critical Implementation Notes

- MongoDB connection uses global caching pattern to prevent leaks in serverless environment (`src/lib/db/mongodb.ts`)
- Production analysis algorithm in `src/lib/utils/calculations.ts` calculates makeable boards and identifies limiting ingredients
- Creating orders automatically debits ingredients from inventory
- Low stock alerts are threshold-based per ingredient
- TypeScript strict mode is enabled
