# Dinery — Frontend (capstone-food-app)

React + Vite frontend for **Dinery**, a web food ordering application inspired
by GrabFood/FeedMe-style ordering flows: browse restaurants, view a menu,
add to cart, and check out — either as a guest or a signed-in account.

Backend repo: `capstone-food-app-api`

---

## Tech Stack

- **Framework:** React (Vite)
- **Routing:** React Router
- **Styling:** Bootstrap + React-Bootstrap, with a custom "Dinery" design
  system layered on top (see Design System below)
- **Auth:** Firebase Authentication (Email/Password)
- **File Storage:** Firebase Storage (restaurant & menu item images)
- **Payments:** Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **HTTP:** `fetch` via a small `authFetch` wrapper in `services/api.js`
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

Firebase config currently lives directly in `src/firebase.js` (not env-based).

### 3. Run the dev server

```bash
npm run dev
```

### 4. Run tests

```bash
npm test
```

---

## Project Structure

```
src/
├─ components/
│  ├─ Navbar.jsx          # Role-aware nav, collapses on mobile
│  └─ ImageUpload.jsx      # Reusable Firebase Storage upload widget
├─ context/
│  ├─ AuthContext.jsx      # Firebase auth state, login/signup/logout
│  ├─ CartContext.jsx      # Cart state, persisted to localStorage
│  └─ __mocks__/           # Mocked contexts for component tests
├─ pages/
│  ├─ Home.jsx              # Restaurant listing
│  ├─ RestaurantDetail.jsx  # Menu grouped by category, add to cart
│  ├─ Cart.jsx               # Checkout: guest info, payment method, Stripe/counter
│  ├─ OrderConfirmation.jsx  # Receipt view for a single order
│  ├─ OrderHistory.jsx       # Consumer's past orders
│  ├─ OwnerDashboard.jsx     # Manage own restaurant(s) + menu items
│  ├─ OwnerOrders.jsx        # Incoming orders, status updates, expandable detail
│  ├─ AdminDashboard.jsx     # Add restaurants, manage users/roles, pause/delete
│  ├─ Login.jsx / Signup.jsx
├─ services/
│  ├─ api.js         # authFetch wrapper + all backend API calls
│  └─ upload.js      # Firebase Storage upload helper
├─ firebase.js        # Firebase app/auth/storage init
└─ setupTests.js      # Test environment setup (jest-dom, confirm() mock)
```

---

## Features by Role

**Consumer (guest or logged in)**

- Browse restaurants, view menus grouped by category
- Add to cart (persisted across refreshes via localStorage)
- Checkout as a guest (name + phone) or while logged in
- Pay online (Stripe) or pay at counter
- View order confirmation / receipt
- Logged-in users get order history (`/orders`)

**Restaurant Owner**

- Manage one or more assigned restaurants (switch via a selector if more than one)
- Edit restaurant details + upload a restaurant image
- Add, edit, delete, and toggle availability of menu items
- View and update status of incoming orders, with an expandable detail view
  showing exactly what was ordered

**Admin**

- All of the above, plus:
- Add new restaurants and assign an owner
- Pause/resume or delete restaurants
- View and change any user's role (consumer / owner / admin)

---

## Design System — "Dinery"

Inspired by the clarity of GrabFood/FeedMe-style ordering apps: bold but
simple, generous whitespace, and a persistent visual cue for cart state so
the customer is never unsure what they've ordered.

**Palette**
| Token | Hex | Use |
|---|---|---|
| `--dinery-forest` | `#1B4B43` | Primary brand color, buttons, nav |
| `--dinery-mango` | `#FFA630` | Call-to-action accent, cart/pay buttons |
| `--dinery-cream` | `#FFF8F0` | Background |
| `--dinery-charcoal` | `#232323` | Body text |
| `--dinery-sage` | `#E8F0EC` | Card/section backgrounds, category pills |
| `--dinery-red` | `#E14434` | Errors, unavailable states |

**Typography:** "Fraunces" (serif) for the brand wordmark and page headers,
"Inter" for body text and UI — chosen for a warm, characterful "diner sign"
feel that stays readable at small sizes.

**Signature interaction:** a sticky mango-colored cart bar appears at the
bottom of the screen the moment an item is added on the Restaurant Detail
page, so the cart is always visible without needing to navigate away.

---

## Testing

Component tests use Vitest + React Testing Library. Since several
components depend on `AuthContext` (which talks to real Firebase on mount),
tests mock `AuthContext` via `vi.mock()` pointed at
`src/context/__mocks__/AuthContext.jsx`, so tests run in isolation without
a live Firebase connection.

Current coverage:

- `Login.test.jsx` — form rendering and input behavior
- `Signup.test.jsx` — form rendering
- `CartContext.test.jsx` — cart logic, including a regression test for a bug
  found during manual testing (cart staying "locked" to a restaurant after
  being emptied — see Bug Fixing Notes below)

`window.confirm` is mocked globally in `setupTests.js` since jsdom (the test
environment) doesn't implement browser dialogs.

---

## Notable Bugs Found & Fixed During Manual Testing

Documenting these deliberately, since they reflect real testing rather than
first-try success:

1. **Cart stuck referencing a deleted restaurant.** Emptying the cart didn't
   reset `restaurantId`, so adding an item from a different restaurant
   afterward incorrectly triggered the "different restaurant" warning.
   Fixed with a `useEffect` that resets `restaurantId` when the cart empties.
   Covered by a regression test.
2. **Owner losing sight of unavailable menu items.** The owner dashboard
   originally reused the public menu endpoint, which filters out unavailable
   items — meaning marking something unavailable made it disappear from the
   owner's own view too. Fixed with a separate `/restaurant/:id/all` route
   for management views.
3. **Multi-restaurant owners only seeing their first restaurant.** The
   `/restaurants/mine` endpoint and dashboard originally assumed one
   restaurant per owner. Updated to return an array and added a restaurant
   selector in the UI.
4. **Menu item images not rendering on the restaurant page** — the menu card
   markup never included an `<img>` tag. Fixed by adding image display with
   a placeholder fallback.
5. **Admin's paused restaurants disappearing from the admin view** — same
   root cause as #2, applied to restaurants instead of menu items. Fixed
   with a `/restaurants/all` admin-only route.
6. **Deleting a menu item or restaurant with order history threw a raw 500
   error** (Postgres foreign key violation). This is actually correct
   database behavior — it protects historical receipts — but the error
   wasn't surfaced clearly. Fixed by catching Postgres error code `23503`
   on the backend and returning a clear message ("mark unavailable/paused
   instead").
7. **Mobile navbar overlap on small screens** (e.g. iPhone SE width) — nav
   links, cart button, and auth buttons crowded into one row. Fixed by
   switching to React-Bootstrap's collapsible `Navbar` with a hamburger
   toggle below the `lg` breakpoint, while keeping the cart button visible
   outside the collapsed menu.

---

## Known Limitations

- Cart is stored in `localStorage`, scoped to one browser/device — it does
  not sync across devices for a logged-in user.
- Order detail visibility for owner/admin accounts is broader than strictly
  necessary (see backend README, Known Limitations).
