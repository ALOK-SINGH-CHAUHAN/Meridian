# Meridian - Enterprise Workforce Operations & Project Management Dashboard

A high-fidelity, single-page operations dashboard built using Next.js, React, TypeScript, and Tailwind CSS v4. Designed for workforce tracking and project task coordination, utilizing a central Context-based state manager and local storage persistence.

---

## 1. Quick Start & Setup

Ensure you have **Node.js 18+** installed, then execute:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build optimized production files
npm run build
```

The application runs locally at `http://localhost:3000`.

---

## 2. Technical Stack & Architectural Decisions

### State Management: React Context API + `useReducer` vs. Redux Toolkit
We implemented state using React Context combined with a reducer framework (`useReducer`).
- **Why Context over Redux?** For a single-page administration mockup, Redux Toolkit introduces substantial boilerplate code (slices, actions, store hooks, middleware configuration) that increases complexity without adding value. A central `AppDataProvider` containing a clean dispatch reducer provides identical modularity and robust actions (e.g. `ADD_TASK`, `UPDATE_TASK_STATUS`) with fewer runtime layers.
- **Data Persistence:** Mutations (creating tasks, completing tasks, adding employees) automatically sync to `localStorage` via the reducer. In a real-world enterprise setting, this context can be swapped out with server actions or react-query fetching schemas without changing any presentation components.

### Routing: Next.js App Router
- **Routing Choice:** Rather than client-side `react-router-dom` routing inside a Vite build, we opted for Next.js App Router. This native path management matches modern production standards, structures endpoints using clean folder hierarchies, and supports robust pre-fetching and static generation.
- **Hydration Safety:** Client-side states (such as active employee searches, theme selections, and modals) include the `"use client";` boundary at the page or component layer. A FOUC (Flash of Unstyled Content) prevention script is embedded in `layout.tsx` to read the theme state and set it before hydration begins.

---

## 3. Directory Structure

```
src/
  app/
    AppProviders.tsx     - Wraps contexts (Theme, AppData) for Next.js
    globals.css          - Tailwind CSS v4 imports, variables, and themes
    layout.tsx           - Persistent shell layout (Sidebar, Topbar)
    page.tsx             - Dashboard Overview screen (/)
    employees/page.tsx   - Employee Directory screen (/employees)
    tasks/page.tsx       - Tasks Workspace screen (/tasks)
    settings/page.tsx    - Settings & theme controls screen (/settings)
  components/
    common/              - Reusable UI elements (Button, Card, Badge, Input, Select, Modal)
    layout/              - Shell chrome (Sidebar, Topbar, PageWrapper)
  context/
    AppDataContext.tsx   - State engine managing tasks, roster, and events
    ThemeContext.tsx     - UI toggle managing light/dark modes
  data/
    mockData.ts          - Local seed data (30 employees, 50 tasks, 20 activity events)
  hooks/
    useLocalStorage.ts   - Key-value persistence helper
    useDebounce.ts       - Input debounce timer
  types/
    index.ts             - Core TypeScript type signatures
  utils/
    dateHelpers.ts       - Relative timestamps and due date validations
    metrics.ts           - Derived metrics calculators
```

---

## 4. Known Limitations & Roadmap

If given additional development time, we would address:
1. **Interactive Drag & Drop:** Upgrade the Task Workspace columns from select-based movers to HTML5 drag-and-drop actions (e.g., using `@hello-pangea/dnd`) for a more intuitive UX.
2. **Dynamic Chart Date Range:** Add range filters (7 days, 30 days, 90 days) on the completions graph, rendering datasets dynamically from more historical logs.
3. **Advanced Filtering:** Allow sorting columns in the directory list and selecting multiple departments simultaneously.
4. **Relational Constraints:** Implement client-side referential integrity so that deleting an employee or reassigning a department automatically updates corresponding task cards.
