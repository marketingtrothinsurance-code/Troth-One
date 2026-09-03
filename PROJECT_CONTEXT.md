# Troth One Project Context

Last audited: 03 September 2026

## Purpose

Troth One is a frontend prototype for a multi-role financial-services platform. It presents separate workspaces for administrators, franchisees, relationship managers, Head Office Operations users, and customers. The current implementation demonstrates dashboards, application tracking, partner management, product discovery, calculators, support workflows, and role-specific data visibility using local mock data.

This repository is a prototype only. It does not currently contain a backend, persistent database, real authentication, API integration, or server-enforced authorization.

## Technology stack

- React 19 with TypeScript and React Strict Mode
- Vite 8 for development and production builds
- Plain CSS in `src/styles.css`
- Lucide React for icons
- npm with `package-lock.json`
- No routing, state-management, form, validation, test, lint, or API-client library

Available scripts:

- `npm run dev` - start the Vite development server
- `npm run build` - run the TypeScript project build and create the Vite production bundle
- `npm run preview` - serve the production bundle locally

## Folder structure

```text
src/
  components/
    AppShell.tsx              Shared sidebar, top bar, role switcher, notifications
    FloatingAIAssistant.tsx   Customer support chatbot UI and local action routing
    UI.tsx                    PageHeader, StatusBadge, StatCard, SearchBox, Select
  config/
    roles.ts                  Role metadata, navigation, product access, canManage flag
  data/
    calculators.ts            Calculator definitions and calculation functions
    franchiseeSupport.ts      Support requests and resource/training fixtures
    mockData.ts               Application/franchisee fixtures and INR formatter
    productCatalogue.ts       Customer-facing product catalogue
  pages/
    ApplicationsPage.tsx      Shared application table, details drawer, creation form
    CustomerCalculator.tsx    Customer financial calculators
    CustomerDashboard.tsx     Dedicated customer dashboard
    CustomerProducts.tsx      Customer holdings and product catalogue
    CustomerSupport.tsx       Customer tickets, FAQs, request form, AI entry point
    Dashboard.tsx             Admin/franchisee/RM/operations dashboards and customer dispatch
    FranchiseeCRM.tsx         Franchisee lead pipeline, lead detail, KYC and conversion actions
    FranchiseeCustomers.tsx   Franchisee customer list and Customer 360 drawer
    FranchiseeDashboard.tsx   Franchisee operational dashboard
    FranchiseesPage.tsx       Admin/RM franchisee list and 360 drawer
    FranchiseeSupport.tsx     Dedicated multi-area franchisee support workspace
    GenericPage.tsx           Shared placeholder/summary implementation for incomplete modules
  services/
    chatService.ts            Local rule-based async chatbot response service
    franchiseeService.ts      Mock-backed Franchisee repository boundary
  types/
    franchisee.ts             Customer, lead, notification and pipeline types
  App.tsx                     Root state, role filtering, and page dispatch
  main.tsx                    React entry point
  styles.css                  Global styles and responsive rules
  types.ts                    Core role, application, franchisee, and navigation types
```

Root build/configuration files include `index.html`, `package.json`, `package-lock.json`, TypeScript configs, and `vite.config.ts`. The root also contains generated `vite.config.js`, `vite.config.d.ts`, and `*.tsbuildinfo` files; treat these as build artifacts, not primary source files.

## Application architecture and navigation

The application is a single React tree. `App.tsx` owns the current `role`, current `page`, application records, and toast message. There is no React Router and there are no URL routes, browser-history entries, deep links, or route guards. Navigation IDs are local state values passed through `onNavigate`.

Changing roles through the top-bar role switcher resets the page to `dashboard`. The role configuration controls sidebar items and allowed product types. `App.tsx` then chooses a page component with conditional rendering; unmatched pages fall back to `GenericPage`.

Temporary cross-page intent is passed through `sessionStorage`:

- `troth-filter` - application status filter
- `troth-open-app` - application drawer to open
- `troth-product-filter` - customer product filter
- `troth-product-focus` - scroll to product exploration
- `troth-support-request` - open customer support request UI
- `troth-ai-bubble-seen` - suppress repeat AI suggestion bubble in the current tab

## Roles, responsibilities, and route map

These are frontend page IDs, not URL paths.

### Admin

Configured user: Aarav Shukla, Platform Administrator.

Navigation:

- `dashboard` - platform KPIs, attention queue, application status, product business, activity
- `franchisees` - full franchisee table, filters, franchisee drawer, add form
- `users` - generic summary/list placeholder
- `customers` - generic customer/CRM summary and add-customer modal
- `applications` - full shared applications workspace; can create and update
- `products` - generic summary/list placeholder
- `operations` - generic summary/list placeholder
- `support` - generic support placeholder and request modal
- `reports` - generic performance view; export is toast-only
- `administration` - generic summary/list placeholder

### Franchisee

Configured user: Neha Sharma, Troth Partner - Ahmedabad.

Navigation:

- `dashboard` - dedicated operational dashboard with customer, lead, application, conversion, revenue, action, follow-up, notification, status, pipeline, and target views
- `customers` - dedicated customer list, filters, add flow, editable permitted contact details, and Customer 360 drawer
- `crm` - dedicated sales pipeline and list views with lead creation, assignment, stages, KYC, activities, follow-ups, conversion, and application initiation
- `applications` - applications restricted to franchisee `Troth Finserve`; can create and update
- `products` - generic summary/list placeholder
- `business` - generic performance summary
- `support` - dedicated Head Office support workspace with marketing, operational, product, technology, and training areas; local request creation and tracker

### Relationship Manager (RM)

Configured user: Rohan Mehta, Relationship Manager - West.

Navigation:

- `dashboard` - assigned partner/business/application KPIs
- `franchisees` - franchisees assigned to Rohan Mehta
- `applications` - applications assigned by the `rm` data field; read-only details
- `performance` - generic performance summary
- `support` - generic support page

### Head Office Operations

Configured user: Priya Nair, Insurance Actioner.

Navigation:

- `dashboard` - insurance operations work KPIs and priority queue
- `work-queue` - shared applications workspace
- `applications` - shared applications workspace
- `documents` - generic document workspace and upload modal
- `communication` - generic communication summary
- `completed` - generic completed-cases summary

Operations data is limited to `Insurance` and `Loan Protector` products. Operations can update application status but cannot create an application.

### Customer

Configured shell user: Yash Thakar. Customer records and customer-facing copy currently use Vivek Joshi; this is an unresolved identity inconsistency.

Navigation:

- `dashboard` - dedicated financial snapshot, product overview, charts, renewals, payments, transactions, applications, service requests, goals, and quick actions
- `my-products` - owned products plus product discovery, search/filter, product details, buy and inquiry forms
- `applications` - records filtered to customer `Vivek Joshi`; read-only details
- `calculator` - 13 local financial calculators with saved scenarios and related products
- `profile` - generic profile/KYC/document view and upload modal
- `support` - dedicated support tickets, FAQs, service-request modal, and floating AI assistant

The floating AI assistant is mounted only on the customer Support page, despite UI copy saying it is available on any customer page.

## Main modules and existing screens

### Shared application workspace

- Product tabs, search, status filter, ageing sort, responsive table, empty state
- Advanced-filter panel is visual only; franchisee, assignee, and date controls do not change results
- Application details drawer with overview, customer, product, documents, workflow, remarks, and activity tabs
- Status updates work locally for Admin, Franchisee, and Operations
- New-application form is available to Admin and Franchisee but only produces a toast; it does not append a record
- Export, document requests, remarks, and several row actions are prototype feedback only

### Franchisee management

- Search and city filter
- Role-filtered RM view
- Franchisee 360 drawer with real overview content and placeholder secondary tabs
- Add-franchisee form is toast-only and does not persist a new franchisee

### Customer products

- Three configured owned products and a larger active catalogue
- Category and text filters
- Product details drawer
- Buy and inquiry forms with local confirmation only
- Holdings, ownership details, and counts are largely hard-coded and are not derived from application data

### Customer calculators

- SIP, lumpsum, goal, retirement, child education, four loan EMI variants, loan eligibility, term cover, health cover, and Loan Protector calculations
- Inputs and calculations run locally
- Saved calculations exist only in component memory and disappear on navigation/remount or refresh
- Related product details, buy, and inquiry flows reuse exports from `CustomerProducts.tsx`

### Support

- Franchisee support has 15 seeded requests, five support areas, local request creation, filters, resource libraries, training sessions, and request detail drawers
- Customer support has three hard-coded tickets, four FAQs, and a service request modal
- `chatService.ts` is a delayed, rule-based local response engine; it does not call an AI or backend API

## Shared and reusable UI

Currently shared:

- `AppShell`: sidebar, mobile navigation, top navigation, role switcher, user identity, and notifications
- `PageHeader`
- `StatusBadge`
- `StatCard`
- `SearchBox`
- `Select`
- Customer product journey components exported by `CustomerProducts.tsx`: `RelatedProductCard`, `ProductDetails`, `BuyJourney`, and `InquiryModal`

Reusable behavior is also expressed through CSS classes for panels, tables, drawers, forms, modals, status badges, grids, and buttons.

Potential reusable components still embedded in page files include application/franchisee/support drawers, generic modal shells, table toolbars, empty states, detail grids, resource cards, and confirmation/toast actions.

## Data models and data flow

Core models in `src/types.ts`:

- `Role`: admin, franchisee, rm, operations, customer
- `ProductType`: Insurance, Loans, Loan Protector, Mutual Fund, Demat, Research, Advisory
- `AppStatus`: New, In Progress, Action Required, Approved, Completed, Delayed, Escalated, Rejected
- `Application`
- `Franchisee`
- `NavItem`
- `RoleConfig`

Feature-specific models live with their fixture modules:

- Catalogue product types in `data/productCatalogue.ts`
- Calculator definitions/results in `data/calculators.ts`
- Franchisee support request/message types in `data/franchiseeSupport.ts`

Current flow:

1. Static data modules provide seed records.
2. `App.tsx` initializes application state from the seed.
3. Role/product/owner filters produce `visibleApplications`.
4. Props pass records and callbacks into pages.
5. Application status edits update root memory only.
6. Other feature state generally lives inside each page and is lost when the component unmounts or the browser refreshes.
7. Toasts simulate many operations that are not actually saved.

There are no repositories, API adapters, DTO mappings, environment-based endpoints, caching, server synchronization, or error/loading states.

## Authentication and role handling

- There is no login page or authentication UI.
- The application always starts as Admin.
- The top-bar selector allows unrestricted switching between all roles.
- Role filtering and action visibility are frontend-only demonstrations.
- There are no tokens, sessions, permission checks from a server, protected routes, or logout flow.
- `canManage` exists in `RoleConfig` but is not consumed; pages use direct role comparisons instead.

Do not treat the current role filtering as a security boundary.

## Styling and responsive behavior

- A single global `styles.css` defines the design system and every feature style.
- Visual language: navy sidebar, white cards, blue primary actions, rounded panels, subtle borders/shadows, DM Sans body type, and Manrope headings.
- CSS custom properties define core color, shadow, and later typography tokens.
- Breakpoints around 1400, 1250, 1200, 1180, 1050, 950, 900, 800, 700, 620/600/580 px adapt dashboards, tables, product grids, drawers, support, and calculators.
- At 900 px the sidebar becomes an off-canvas mobile menu.
- Tables normally scroll horizontally; the smallest breakpoint converts the main data table to card-like rows.
- Several horizontal card/tab strips support narrow screens.

The stylesheet is heavily compressed into long lines, contains feature blocks and later override blocks, and repeats some breakpoint values. Preserve selector order unless intentionally refactoring, because later typography overrides depend on cascade order.

## Current development status

Implemented to prototype depth:

- Role switching and role-specific navigation
- Role-filtered application views
- Dedicated dashboards for all roles (customer has a separate expanded dashboard)
- Application table/details/status updates
- Admin/RM franchisee list and drawer
- Customer product catalogue and calculators
- Dedicated customer and franchisee support experiences
- Franchisee Phase 1 operational dashboard, customer management, and CRM/sales pipeline
- Typed Franchisee mock repository boundary for customers, leads, and notifications
- Responsive shell and major page layouts

Incomplete or placeholder behavior:

- Authentication, authorization, login, logout, and user sessions
- URL routing, deep linking, back/forward history, and 404 handling
- Backend/API integration and persistent writes
- Real file upload/download/export/email/callback behavior
- Real global top-bar search and keyboard shortcut
- Advanced application filters
- Many Admin, RM, and Operations modules plus Franchisee Products and Business are rendered by `GenericPage`
- Most secondary Franchisee 360 tabs
- Actual persistent application/franchisee/user creation; Phase 1 Franchisee customer and lead creation is local in-memory only
- Customer ticket persistence and detail views
- Validation beyond basic native HTML requirements
- Loading, server-error, retry, optimistic-update, and empty-data states for future APIs
- Automated tests, linting, formatting, and CI configuration
- Accessibility validation, focus trapping, and comprehensive keyboard behavior for dialogs/drawers

## Structural issues and inconsistencies

- Navigation is a growing conditional chain in `App.tsx`, not a typed route registry.
- `GenericPage.tsx` multiplexes many unrelated modules and contains placeholder data/behavior, making feature ownership unclear.
- Several page files contain many inline subcomponents and dense one-line JSX; this makes review and targeted changes difficult.
- `styles.css` is monolithic and cascade-dependent, with repeated media-query ranges and a later typography override layer.
- Role permission logic is duplicated in page conditions; the existing `canManage` flag is unused and too coarse for real permissions.
- Customer identity is inconsistent: shell configuration says Yash Thakar, while customer filtering and content use Vivek Joshi.
- Franchisee identity is inconsistent: shell configuration says Neha Sharma, while support authorship and franchisee details use Neha Patel.
- Product taxonomy is inconsistent across modules: `Mutual Fund` versus `Mutual Funds`, plus catalogue-only groupings such as `Investments` and `Research / Advisory`.
- Dates and several KPI totals are hard-coded to August/September 2026 rather than derived from data or current time.
- Dashboard/card/product/support datasets duplicate business facts instead of sharing a normalized source.
- Product action flags (`buyEnabled`, `inquiryEnabled`, `detailsEnabled`) exist but the customer UI does not check them before rendering actions.
- `statusTone` in `UI.tsx` and `query` state in `GenericPage.tsx` are currently unused.
- `FloatingAIAssistant` is reusable in shape but mounted only by `CustomerSupport`.
- Some generated TypeScript/Vite output is present at the repository root.
- There is no Git repository detected at this workspace path, so change history and diff-based safeguards are unavailable here.

## Recommended architecture improvements

Apply incrementally when a relevant feature is requested; do not perform a broad rewrite.

1. Introduce a typed route/page registry first, preserving the existing page IDs. Add a URL router only when deep-linking is required.
2. Define a capability-based permission map (view, create, update, export, assign, approve) and use it consistently for navigation and actions.
3. Establish a service/repository layer that initially wraps mock data, then replace implementations with APIs without changing page contracts.
4. Split `GenericPage` as each placeholder module becomes real; do not split everything pre-emptively.
5. Extract repeated modal, drawer, table-toolbar, empty-state, and form-field primitives when a second real use case needs the same behavior.
6. Move product journey components from the customer page into a feature/shared component folder when they are reused further.
7. Normalize customer/franchisee identity and product taxonomy before connecting APIs.
8. Break CSS into ordered foundation, shell, shared-component, and feature styles while preserving the existing visual design and cascade.
9. Add lint/format checks and focused tests for role visibility, filtering, status updates, and calculator functions.
10. Add real authentication and server-enforced authorization before treating the prototype as production-capable.

## Files that should not be changed unnecessarily

- `src/config/roles.ts`: navigation and visibility source of truth; changes affect every role.
- `src/types.ts`: shared contracts used throughout the application.
- `src/App.tsx`: root dispatch and role filtering; a small change can affect all workspaces.
- `src/components/AppShell.tsx`: shared desktop/mobile shell for every role.
- `src/components/UI.tsx`: shared UI primitives and status rendering.
- `src/styles.css`: global cascade for all roles and responsive layouts.
- `src/data/mockData.ts`: shared seed data used by multiple dashboards and tables.
- `src/pages/ApplicationsPage.tsx`: shared across all five roles.
- `src/pages/CustomerProducts.tsx`: exports components used by calculators and the AI assistant.
- Lockfiles and TypeScript/Vite configuration unless a dependency or build change genuinely requires it.

Before deleting or renaming any file or exported component, search all imports and string-based page IDs because navigation is not enforced by a router or compiler-generated route map.

## Naming and UI conventions

- Components, types, and interfaces use PascalCase.
- Variables, functions, and page IDs use camelCase or kebab-case strings.
- Role IDs are lowercase; Head Office Operations uses the internal ID `operations`.
- Pages receive data/callbacks through props and generally own transient UI state locally.
- Event callbacks use `on...` names (`onNavigate`, `onToast`, `onUpdate`).
- Product/application statuses are human-readable strings rendered through `StatusBadge`.
- Prefer `formatINR` for monetary display.
- Use existing button classes (`primary-btn`, `secondary-btn`, `icon-button`) and existing panel/drawer/modal styles.
- Use Lucide icons rather than adding another icon dependency.
- Maintain current desktop, tablet, and mobile behavior.

## Instructions for future Codex sessions

1. Read this file, then inspect the specific source files relevant to the request; this document describes the audit state but source code remains authoritative.
2. State the minimum files you intend to modify before editing application code.
3. Do not rebuild working pages or redesign the application unless explicitly requested.
4. Preserve page IDs and role navigation unless the request requires a route change.
5. Reuse existing shared UI and feature components where practical.
6. Keep changes isolated so another role's dashboard and shared application workspace are not unintentionally affected.
7. Treat all current mutations and service responses as local prototype behavior unless a backend integration is explicitly requested.
8. Do not invent APIs, authentication behavior, data persistence, or business rules.
9. When adding an API, keep mock and remote implementations behind a stable service boundary.
10. Search usages before renaming/deleting and account for string-based navigation/session-storage keys.
11. Verify changes with `npm run build`; add focused tests when test infrastructure exists or when introducing it is part of the request.
12. Report files changed, behavior changed, assumptions, verification, and remaining work.

## Pending decisions before production integration

- Canonical customer and franchisee identities
- Canonical product taxonomy across applications, catalogue, dashboards, and APIs
- URL routing strategy
- Authentication provider and session model
- Fine-grained permission matrix
- Backend resource contracts for applications, customers, franchisees, products, documents, support, and reports
- Persistence strategy for drafts, saved calculations, inquiries, and uploads
- Audit/event model for regulated actions
- Accessibility and browser support targets
