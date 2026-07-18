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
  system layered on top
- **Auth:** Firebase Authentication (Email/Password + Google Sign-In)
- **File Storage:** Firebase Storage (restaurant & menu item images)
- **Payments:** Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **HTTP:** `fetch` via a small `authFetch` wrapper in `services/api.js`
- **Deployment:** Vercel

---

## Getting Started

### 1. Install dependencies & packages

```bash
npm install
npm install react-router-dom bootstrap react-bootstrap
npm install bootstrap-icons
npm install axios
npm install firebase
npm install @stripe/react-stripe-js @stripe/stripe-js
npm install usehooks-ts
```

### 2. Environment variables

Create a `.env` file in the project root:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
VITE_API_BASE_URL=http://localhost:3000/api
```

Firebase config currently lives directly in `src/firebase.js` using
`import.meta.env` variables (`VITE_API_KEY`, `VITE_AUTH_DOMAIN`,
`VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`,
`VITE_APP_ID`) — set these in `.env` as well, pulled from your Firebase
project settings.

### 3. Run the dev server

```bash
npm run dev
```

---

## Deployment

Deployed on Vercel. Since this is a single-page app using React Router,
`vercel.json` includes a rewrite so any route resolves to `index.html` and
lets the router handle it client-side:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

In Vercel's project settings, set `VITE_API_BASE_URL` to the deployed
backend's URL (e.g. `https://your-backend.vercel.app/api`), along with the
Stripe publishable key and Firebase config variables. Vite bakes environment
variables into the build at build time, so a fresh deploy is required after
changing any of them — updating the dashboard value alone has no effect
until the next build.

Also make sure the deployed frontend domain is added under Firebase
Console → Authentication → Settings → Authorized domains, or login
(especially Google Sign-In) will fail on the live site.

---

## Project Structure

```
src/
├─ components/
│  ├─ Navbar.jsx          # Role-aware nav, collapses on mobile
│  ├─ ImageUpload.jsx      # Reusable Firebase Storage upload widget
│  └─ Toast.jsx            # Lightweight success/error notification
├─ context/
│  ├─ AuthContext.jsx      # Firebase auth state, login/signup/logout/Google
│  └─ CartContext.jsx      # Cart state, persisted to localStorage
├─ pages/
│  ├─ Home.jsx               # Restaurant listing
│  ├─ RestaurantDetail.jsx   # Menu grouped by category, sticky category/search bar, add to cart
│  ├─ Cart.jsx                # Checkout: guest info, payment method, Stripe/counter
│  ├─ OrderConfirmation.jsx   # Receipt view for a single order
│  ├─ OrderHistory.jsx        # Consumer's past orders
│  ├─ OwnerDashboard.jsx      # Manage own restaurant(s), menu items, drag-and-drop category order
│  ├─ OwnerOrders.jsx         # Incoming orders, status updates, expandable detail
│  ├─ AdminDashboard.jsx      # Add restaurants, manage users/roles, pause/delete, searchable role table
│  ├─ Login.jsx / Signup.jsx  # Email/password + Google sign-in
├─ services/
│  ├─ api.js         # authFetch wrapper + all backend API calls
│  └─ upload.js      # Firebase Storage upload helper
└─ firebase.js        # Firebase app/auth/storage init
```

---

## Features by Role

**Consumer (guest or logged in)**

- Browse restaurants, view menus grouped by category
- Sticky category dropdown + expandable search on the restaurant page
- Add to cart (persisted across refreshes via localStorage), with toast
  feedback on add
- Checkout as a guest (name + phone) or while logged in
- Pay online (Stripe) or pay at counter
- View order confirmation / receipt, including item images and which
  restaurant the order came from
- Logged-in users get order history (`/orders`)
- Sign up / log in via email+password or Google

**Restaurant Owner**

- Manage one or more assigned restaurants (switch via a selector if more
  than one)
- Edit restaurant details (explicit Save button, with confirmation toast)
  and upload a restaurant image
- Add, edit, delete, and toggle availability of menu items
- Reorder menu categories via drag-and-drop, reflected on the public
  restaurant page
- View and update status of incoming orders, with an expandable detail view
  showing exactly what was ordered

**Admin**

- All of the above, plus:
- Add new restaurants and assign an owner
- Pause/resume or delete restaurants
- View and change any user's role (consumer / owner / admin), with search,
  role filtering, and pagination for managing larger user lists
