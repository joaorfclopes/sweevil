# Sweevil E-Commerce - Refactor Plan

## Codebase Overview

**Stack:** MERN (MongoDB/Mongoose, Express, React 17/Redux, Node.js)
**Deployment:** Heroku
**Payment:** PayPal
**Email:** Nodemailer (Gmail OAuth2)
**Storage:** AWS S3

### Core E-Commerce Modules

| Module | Backend | Frontend (Actions/Reducers) | Frontend (Screens) |
|---|---|---|---|
| **Cart** | N/A (client-side only) | `cartActions.js`, `cartReducer.js` | `CartScreen.jsx` |
| **Checkout** | `orderRoute.js` (POST `/`) | `orderActions.js` (createOrder) | `ShippingScreen.jsx`, `PlaceOrderScreen.jsx` |
| **Inventory** | `productModel.js` (countInStock), `orderRoute.js` (`/pay`, `/cancel`) | Inline in order actions | Managed via `ProductEditScreen.jsx` |
| **Products** | `productRoute.js`, `productModel.js` | `productActions.js`, `productReducers.js` | `ShopScreen.jsx`, `ProductScreen.jsx`, `ProductEditScreen.jsx` |
| **Orders** | `orderRoute.js`, `orderModel.js` | `orderActions.js`, `orderReducers.js` | `OrderScreen.jsx`, `OrdersTable.jsx` |
| **Users/Auth** | `userRoute.js`, `userModel.js`, `utils.js` | `userActions.js`, `userReducers.js` | `SigninScreen.jsx` |
| **Email** | `emailRoute.js`, `mailing/*.js` | Triggered from `orderActions.js` | N/A |

---

## Top 5 Technical Debt Hotspots

### 1. Inventory Stock Management - Duplicated Size Logic & Race Conditions

**Severity:** Critical
**Files:**
- `backend/routes/orderRoute.js:132-154` (pay endpoint)
- `backend/routes/orderRoute.js:170-193` (cancel endpoint)
- `frontend/src/screens/ProductScreen.jsx:251-295`
- `frontend/src/screens/CartScreen.jsx:139-176`

**Problem:**
The clothing size-to-stock mapping uses deeply nested ternary chains that are copy-pasted across 4+ locations. Each place manually maps size strings ("XS", "S", "M", etc.) to `countInStock.xs`, `countInStock.s`, etc. This means:

- **Duplication:** The same 6-branch ternary appears in the pay route, cancel route, CartScreen, and ProductScreen. Adding a new size requires changes in all locations.
- **Race condition:** The pay/cancel endpoints use `forEach(async ...)` which does not await each iteration. Multiple concurrent payments could read stale stock values and produce incorrect decrements. The `forEach` with `async` callback returns immediately, so inventory updates are fire-and-forget with no error handling.
- **Product lookup by name:** Stock updates find products via `Product.findOne({ name: item.name })` instead of using the `item.product` ObjectId reference, which is fragile if product names change.

**Recommended Fix:**
- Extract a shared `getStockForSize(product, size)` / `updateStockForSize(product, size, delta)` utility used by both backend and frontend.
- Replace `forEach(async ...)` with `Promise.all(items.map(...))` or a `for...of` loop with proper `await`.
- Use `item.product` (ObjectId) instead of `item.name` for product lookup.
- Consider using MongoDB's `$inc` atomic operator instead of read-modify-save to prevent race conditions entirely.

---

### 2. Security Gaps - Missing Auth, Input Validation, and Hardcoded Secrets

**Severity:** Critical
**Files:**
- `backend/routes/orderRoute.js:79-104` (POST `/` - no auth)
- `backend/routes/orderRoute.js:106-116` (GET `/:id` - no auth)
- `backend/routes/orderRoute.js:118-161` (PUT `/:id/pay` - no auth)
- `backend/routes/orderRoute.js:163-201` (PUT `/:id/cancel` - no auth)
- `backend/routes/userRoute.js:64-74` (GET `/:id` - no auth, returns full user object)
- `backend/utils.js:12` (hardcoded JWT fallback `"somethingsecret"`)
- `frontend/src/screens/PlaceOrderScreen.jsx:23-26` (price calculated client-side)

**Problem:**
- **Unauthenticated order creation:** Anyone can POST to `/api/orders` without authentication, enabling spam or abuse.
- **Unauthenticated order access:** Any order can be viewed, paid, or canceled by anyone who knows or guesses the order ID. No ownership verification.
- **User data exposure:** `GET /api/users/:id` returns the full user document (including hashed password) without any authentication.
- **Client-side price calculation:** `itemsPrice`, `shippingPrice`, and `totalPrice` are computed in the browser (`PlaceOrderScreen.jsx:23-26`) and sent directly to the server, which trusts them. A malicious user could set `totalPrice: 0`.
- **Hardcoded JWT secret:** `utils.js` falls back to `"somethingsecret"` if `JWT_SECRET` is unset, which is a security risk in production.
- **No input validation:** No server-side validation on order items, quantities, shipping addresses, or user registration fields. No sanitization of any inputs.
- **Password reset by ID:** The `resetPassword/:id` endpoint accepts a user ID in the URL with no verification token, meaning anyone who knows a user ID can reset their password.

**Recommended Fix:**
- Add `isAuth` middleware to all order endpoints (create, view, pay, cancel). Add ownership checks so users can only access their own orders.
- Recalculate prices server-side from product data during order creation and payment. Never trust client-supplied prices.
- Remove the hardcoded JWT fallback; fail explicitly if `JWT_SECRET` is missing.
- Add input validation middleware (e.g., `express-validator` or `joi`) for all endpoints.
- Protect `GET /users/:id` with `isAuth` and strip sensitive fields (password hash).
- Implement a secure token-based password reset flow instead of raw user ID.

---

### 3. Email Notification System - Tightly Coupled, Blocking, and Fragile

**Severity:** High
**Files:**
- `frontend/src/actions/orderActions.js:67-92` (payOrder)
- `frontend/src/actions/orderActions.js:94-129` (sendOrder)
- `frontend/src/actions/orderActions.js:131-166` (deliverOrder)
- `frontend/src/actions/orderActions.js:168-193` (cancelOrder)
- `backend/routes/emailRoute.js:17-38` (sendEmail function)
- `backend/routes/emailRoute.js:40-237` (all endpoints)

**Problem:**
- **Client-triggered emails:** Email sending is initiated from the frontend Redux actions (e.g., `orderActions.js:76-82`). After a successful pay API call, the frontend makes separate HTTP requests to `/api/email/placedOrder` and `/api/email/placedOrderAdmin`. If the user closes the browser or loses connectivity after payment but before these calls complete, no emails are sent.
- **No authentication on email endpoints:** Most email endpoints (`/placedOrder`, `/sentOrder`, `/cancelOrder`, `/cancelOrderAdmin`) have no auth middleware. Anyone can trigger arbitrary email sends by POSTing order data directly.
- **Transporter created per request:** `emailRoute.js:18-28` creates a new `nodemailer.createTransport()` instance on every email send, instead of reusing a single transporter.
- **Poor error response format:** The email error handler returns `{ yo: "error" }` (line 32) with no HTTP error status code, making failures invisible to the client.
- **Massive code duplication:** Every email endpoint in `emailRoute.js` repeats the same `mailOptions` structure with minor variations across 200+ lines. The order data reshaping logic is identical in 6 endpoints.

**Recommended Fix:**
- Move email triggering to the backend. When an order is paid/sent/delivered/canceled on the server, send emails as a side effect within the same route handler (or via an event emitter/queue).
- Add authentication to all email endpoints (or remove them as public API and call email functions internally).
- Create a singleton transporter instance and reuse it across requests.
- Extract a shared `buildOrderMailOptions(type, order)` helper to eliminate the repeated mail construction code.
- Return proper HTTP error codes on email failures.

---

### 4. Frontend Architecture - jQuery in React, Duplicated Price Logic, Stale Patterns

**Severity:** High
**Files:**
- `frontend/src/screens/CartScreen.jsx:6,74-76` (jQuery import and usage)
- `frontend/src/screens/PlaceOrderScreen.jsx:5,45-47` (jQuery import and usage)
- `frontend/src/screens/OrderScreen.jsx:7,152-154` (jQuery import and usage)
- `frontend/src/screens/ProductScreen.jsx:5,86-91` (jQuery import and usage)
- `frontend/src/screens/CartScreen.jsx:65-68` (price calculation)
- `frontend/src/screens/PlaceOrderScreen.jsx:23-26` (duplicated price calculation)
- `frontend/src/store.js` (Redux store setup)

**Problem:**
- **jQuery in React:** Multiple screen components import jQuery (`$`) to add CSS classes (e.g., `$(\`#${id}-cart-img\`).addClass("show")`). This bypasses React's virtual DOM, creates a redundant dependency (~87KB minified), and can cause state synchronization issues. This pattern appears in at least 4 screens.
- **Duplicated price/shipping calculation:** `cart.itemsPrice`, `cart.shippingPrice`, and `cart.totalPrice` are calculated identically in both `CartScreen.jsx:65-68` and `PlaceOrderScreen.jsx:23-26`. This also mutates Redux state directly (`cart.itemsQty = ...`) outside of a reducer, which is a Redux anti-pattern.
- **Deprecated React Router patterns:** The app uses `props.history.push()` and `props.match.params.id` which are React Router v5 class-component patterns. The app is on React 17 but could benefit from React Router v6 hooks (`useNavigate`, `useParams`).
- **No code splitting:** `App.js` imports all 16 screens eagerly. There is no `React.lazy()` or dynamic import, meaning the entire application JavaScript is loaded on first visit.
- **Notification library per render:** `new Notyf()` is called inside the component body on every render in `CartScreen.jsx:18` and `ProductScreen.jsx:23`, creating a new instance each time instead of using a ref or singleton.

**Recommended Fix:**
- Replace all jQuery DOM manipulation with React `useRef` + `useState`/`useCallback` patterns for CSS class toggling.
- Extract price/shipping calculation into a Redux selector or a shared utility function. Never mutate Redux state outside reducers.
- Add `React.lazy()` with `Suspense` for route-level code splitting.
- Move `new Notyf()` into a `useRef` or create a notification context/hook.
- Consider upgrading to React Router v6 for modern hook-based routing.

---

### 5. Backend Architecture - No Separation of Concerns, No Error Strategy

**Severity:** Medium
**Files:**
- `backend/server.js:54-56` (error handler missing `next` parameter)
- `backend/routes/orderRoute.js` (business logic inline in routes)
- `backend/routes/userRoute.js` (business logic inline in routes)
- `backend/routes/emailRoute.js` (business logic inline in routes)
- `backend/routes/productRoute.js` (CRUD logic inline in routes)

**Problem:**
- **No layered architecture:** All business logic (inventory management, order status transitions, price validation, email orchestration) lives directly inside Express route handlers. There are no service/controller layers. This makes unit testing impossible without spinning up an Express server and a database.
- **Broken error handler:** The global error handler in `server.js:54` is `(err, req, res)` but Express error handlers require exactly 4 parameters `(err, req, res, next)`. Without the `next` parameter, Express won't recognize it as an error handler and it will never be called.
- **Inconsistent error codes:** Errors use mixed HTTP status codes - a creation failure returns `401` (`orderRoute.js:101`), user update failures return `404` (`userRoute.js:102`), and email errors return `200` with `{ yo: "error" }` (`emailRoute.js:32`).
- **No request body size limits:** `express.json()` is used without a `limit` option, making the server vulnerable to large payload attacks.
- **Database seed routes in production:** `GET /products/seed` and `GET /users/seed` are accessible without authentication and will overwrite production data if called.
- **Deprecated Mongoose options:** `useNewUrlParser`, `useUnifiedTopology`, and `useCreateIndex` are no longer needed in modern Mongoose versions and generate warnings.

**Recommended Fix:**
- Introduce a service layer: `orderService.js`, `productService.js`, `userService.js` that contain business logic, with route files only handling HTTP request/response mapping.
- Fix the error handler to include all 4 parameters: `(err, req, res, next)`.
- Standardize HTTP error codes (400 for bad input, 401 for unauthorized, 403 for forbidden, 404 for not found, 500 for server errors).
- Add `express.json({ limit: '1mb' })` to prevent payload abuse.
- Gate seed routes behind `NODE_ENV !== 'production'` or remove them entirely.
- Remove deprecated Mongoose connection options.

---

## 6. Security Hardening - Implementation Plan

This section focuses on all security fixes and bug-prone code that needs to be addressed. Items are ordered by severity.

### 6.1 Server-Side Price Recalculation (P0)

**Problem:** Prices are calculated in the browser and blindly trusted by the backend.
**Files to change:** `backend/routes/orderRoute.js` (POST `/` and PUT `/:id/pay`)

**Plan:**
- In the POST `/` handler, ignore `itemsPrice`, `shippingPrice`, and `totalPrice` from the request body.
- Fetch each product by its `product` ObjectId, verify it exists, and use the database price.
- Recalculate: `itemsPrice = sum(product.price * qty)`, `shippingPrice = itemsPrice >= 40 ? 0 : 9.99`, `totalPrice = itemsPrice + shippingPrice`.
- Return 400 if any product is not found or if requested quantity exceeds stock.

### 6.2 Authentication & Authorization on Order Endpoints (P0)

**Problem:** Orders can be created, viewed, paid, and canceled by unauthenticated users.
**Files to change:** `backend/routes/orderRoute.js`, `backend/models/orderModel.js`

**Plan:**
- Add a `user` field (ObjectId ref) to orderModel.js for authenticated users.
- Add `isAuth` middleware to POST `/` (order creation). Store `req.user._id` as the order owner.
- Add `isAuth` to GET `/:id` with ownership check (`order.user === req.user._id || req.user.isAdmin`).
- Add `isAuth` to PUT `/:id/pay` and PUT `/:id/cancel` with the same ownership check.
- Guest checkout consideration: if guest checkout is desired, generate a unique order token returned at creation, and require it for subsequent access instead of auth. This avoids breaking the current UX while still preventing random access.

### 6.3 User Data Exposure (P0)

**Problem:** `GET /api/users/:id` returns full user documents including password hashes, with no auth.
**Files to change:** `backend/routes/userRoute.js`

**Plan:**
- Add `isAuth` middleware to `GET /:id`.
- Add ownership check: a user can only fetch their own profile, unless admin.
- Exclude `password` from the response using `.select('-password')` in the Mongoose query.

### 6.4 Hardcoded JWT Secret Removal (P0)

**Problem:** `utils.js` falls back to `"somethingsecret"` if `JWT_SECRET` env var is unset.
**Files to change:** `backend/utils.js`

**Plan:**
- Remove the `|| "somethingsecret"` fallback from both `generateToken` and `isAuth`.
- Add a startup check in `server.js` that throws an error if `JWT_SECRET` is not set, preventing the server from starting with an insecure default.

### 6.5 Secure Password Reset Flow (P0)

**Problem:** `resetPassword/:id` accepts a raw user ID with no verification token.
**Files to change:** `backend/routes/userRoute.js`, `backend/routes/emailRoute.js`, `backend/models/userModel.js`

**Plan:**
- Add `resetPasswordToken` (String) and `resetPasswordExpires` (Date) fields to userModel.
- When `/forgotPassword` is called, generate a cryptographically random token (`crypto.randomBytes(32)`), hash it, store it on the user with a 1-hour expiry.
- Send the unhashed token in the reset link URL.
- In `resetPassword/:id`, verify the token matches the stored hash and has not expired before allowing the password change.
- Clear the token fields after successful reset.

### 6.6 Input Validation (P0)

**Problem:** No server-side validation on any endpoint. Malformed data can cause crashes or unexpected behavior.
**Files to change:** All route files in `backend/routes/`

**Plan:**
- Add `express-validator` as a dependency.
- Create validation middleware chains for:
  - **User registration:** name (string, 2-100 chars), email (valid email format), phoneNumber (numeric), password (min 6 chars).
  - **Order creation:** orderItems (non-empty array), each item has product (valid ObjectId), qty (positive integer), size (one of valid sizes or empty).
  - **Shipping address:** fullName, email, phoneNumber, address, city, postalCode, country (all required strings).
  - **Product creation/update:** name, price (positive number), category, countInStock fields.
- Return 400 with descriptive error messages on validation failure.

### 6.7 Inventory Race Condition Fix (P0)

**Problem:** `forEach(async ...)` doesn't await; concurrent payments corrupt stock.
**Files to change:** `backend/routes/orderRoute.js` (pay and cancel handlers)

**Plan:**
- Replace `forEach(async (item) => { ... })` with `for (const item of order.orderItems) { ... }` using proper `await`.
- Use `Product.findById(item.product)` instead of `Product.findOne({ name: item.name })`.
- Better: use MongoDB atomic `$inc` operator: `Product.updateOne({ _id: item.product }, { $inc: { 'countInStock.stock': -item.qty } })` to eliminate read-modify-save race conditions.
- Extract a `updateInventory(orderItems, operation)` helper (`operation` = 'decrement' | 'increment') shared by both pay and cancel.
- Add stock validation before payment: verify all items have sufficient stock, return 400 if not.

### 6.8 Email Endpoint Security (P1)

**Problem:** Most email endpoints have no authentication - anyone can trigger emails.
**Files to change:** `backend/routes/emailRoute.js`, `backend/routes/orderRoute.js`

**Plan:**
- Remove email endpoints as a public API entirely.
- Move email sending into the backend order route handlers as internal function calls:
  - `PUT /:id/pay` -> call `sendPlacedOrderEmail(order)` and `sendPlacedOrderAdminEmail(order)` directly.
  - `PUT /:id/send` -> call `sendShippedEmail(order)` directly.
  - `PUT /:id/deliver` -> call `sendDeliveredEmail(order)` directly.
  - `PUT /:id/cancel` -> call `sendCancelEmail(order)` and `sendCancelAdminEmail(order)` directly.
- Remove the corresponding `Axios.post('/api/email/...')` calls from frontend `orderActions.js`.
- Keep only `/forgotPassword` as a public email endpoint (it needs to be callable without auth).

### 6.9 Request Body Size Limit (P1)

**Problem:** `express.json()` has no size limit, enabling large payload attacks.
**Files to change:** `backend/server.js`

**Plan:**
- Change `app.use(express.json())` to `app.use(express.json({ limit: '1mb' }))`.

### 6.10 Production Seed Route Protection (P1)

**Problem:** `/products/seed` and `/users/seed` can overwrite production data.
**Files to change:** `backend/routes/productRoute.js`, `backend/routes/userRoute.js`, `backend/routes/galleryImageRoute.js`

**Plan:**
- Wrap seed routes in a `NODE_ENV` check: only register them if `process.env.NODE_ENV !== 'production'`.
- Alternatively, remove them entirely and use a separate seed script (`node backend/seed.js`) instead.

### 6.11 Fix Global Error Handler (P1)

**Problem:** Error handler has 3 params instead of 4, so Express never invokes it.
**Files to change:** `backend/server.js`

**Plan:**
- Change `(err, req, res)` to `(err, req, res, next)`.
- Add proper error logging and a consistent JSON error response format.
- Ensure it returns appropriate status codes (default 500 for unhandled errors).

### 6.12 Fix Email Error Responses (P2)

**Problem:** Email errors return `{ yo: "error" }` with HTTP 200.
**Files to change:** `backend/routes/emailRoute.js`

**Plan:**
- Return `res.status(500).send({ message: "Failed to send email" })` on transporter errors.
- Create the nodemailer transporter once at module level, not per request.

---

## 7. Automated Security & Dependency Management (CI/CD)

### 7.1 GitHub Dependabot - Automatic Dependency Updates

**Purpose:** Automatically create PRs when dependencies have new versions or known vulnerabilities.
**File to create:** `.github/dependabot.yml`

**Plan:**
```yaml
version: 2
updates:
  # Root package.json
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
    groups:
      dev-dependencies:
        dependency-type: "development"
        update-types: ["minor", "patch"]

  # Frontend package.json
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "frontend"
    groups:
      dev-dependencies:
        dependency-type: "development"
        update-types: ["minor", "patch"]
```

**Why Dependabot:**
- Built into GitHub (free, zero setup beyond the YAML file).
- Automatically opens PRs for both security patches and version updates.
- Groups minor/patch dev dependency updates to reduce PR noise.
- Covers both root (backend) and `/frontend` directories separately.

### 7.2 Snyk Security Scanning - GitHub Action

**Purpose:** Deep vulnerability scanning on every push/PR, with results visible in GitHub's Security tab.
**File to create:** `.github/workflows/snyk-security.yml`

**Plan:**
```yaml
name: Snyk Security Scan

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
  schedule:
    - cron: '0 8 * * 1'  # Weekly Monday 8am

jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install root dependencies
        run: npm install

      - name: Install frontend dependencies
        run: cd frontend && npm install

      - name: Run Snyk (backend)
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=medium --sarif-file-output=snyk-backend.sarif

      - name: Run Snyk (frontend)
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=medium --file=frontend/package.json --sarif-file-output=snyk-frontend.sarif

      - name: Upload Backend SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: snyk-backend.sarif

      - name: Upload Frontend SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: snyk-frontend.sarif
```

**Setup required:**
1. Create a free Snyk account at snyk.io and get the API token.
2. Add the token as a GitHub repo secret named `SNYK_TOKEN`.

### 7.3 Secret Detection - GitHub Action

**Purpose:** Prevent accidental commits of API keys, passwords, and tokens.
**File to create:** `.github/workflows/secret-scan.yml`

**Plan:**
```yaml
name: Secret Detection

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
```

**Why TruffleHog:**
- Free and open source.
- Scans for verified secrets (actual live credentials), reducing false positives.
- Scans full git history, not just current files.

### 7.4 npm audit - GitHub Action

**Purpose:** Lightweight built-in vulnerability check as a complement to Snyk.
**Add to existing CI or create:** `.github/workflows/audit.yml`

**Plan:**
```yaml
name: npm Audit

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Audit root
        run: npm audit --audit-level=high

      - name: Audit frontend
        run: cd frontend && npm audit --audit-level=high
```

### Summary of CI/CD Security Stack

| Tool | Purpose | Trigger | Cost |
|---|---|---|---|
| **Dependabot** | Auto-PRs for dependency updates & security patches | Weekly schedule | Free (built-in) |
| **Snyk** | Deep vulnerability scanning with SARIF reporting | Push, PR, weekly | Free tier (200 tests/month) |
| **TruffleHog** | Secret/credential detection in code & git history | Push, PR | Free (open source) |
| **npm audit** | Built-in Node.js vulnerability check | Push, PR | Free (built-in) |

---

## 8. Portugal E-Commerce Legal Compliance

Portuguese law requires online stores to display specific legal information and links. Non-compliance can result in fines from ASAE (Autoridade de Segurança Alimentar e Económica).

### 8.1 Required Legal Pages

These pages need to be created and linked from the site footer (visible on all pages):

#### 8.1.1 Termos e Condições (Terms & Conditions)
**Legal basis:** DL 7/2004 (Lei do Comércio Eletrónico), DL 24/2014
**Content must include:**
- Company identification (name, NIF, registered address, contact email/phone)
- Description of products/services offered
- Payment methods and conditions
- Delivery terms (timeframes, costs, geographic coverage)
- Right of withdrawal (14-day cooling-off period)
- Warranty conditions
- Liability limitations
- Applicable law and jurisdiction

#### 8.1.2 Política de Privacidade (Privacy Policy)
**Legal basis:** RGPD/GDPR (Regulation EU 2016/679), Lei n.º 58/2019
**Content must include:**
- Identity of the data controller (company name, NIF, contact)
- What personal data is collected (name, email, phone, address, payment info)
- Purpose and legal basis for processing
- Data retention periods
- Third parties data is shared with (PayPal, AWS S3, Gmail/Google)
- User rights (access, rectification, erasure, portability, objection)
- How to exercise those rights (contact email)
- Right to lodge a complaint with the CNPD (Comissão Nacional de Proteção de Dados)

#### 8.1.3 Política de Cookies (Cookie Policy)
**Legal basis:** EU ePrivacy Directive, Lei n.º 41/2004 (amended by Lei n.º 46/2012)
**Content must include:**
- What cookies are used and their purpose
- Distinction between essential and non-essential cookies
- How to manage/reject cookies
- Note: The app already has `react-cookie-consent` but needs a proper policy page behind it

#### 8.1.4 Política de Devoluções e Direito de Livre Resolução (Returns & Right of Withdrawal)
**Legal basis:** DL 24/2014 (Consumer Rights Directive transposition)
**Content must include:**
- 14-day withdrawal period from date of delivery (no reason required)
- How to exercise the right (provide a model withdrawal form)
- Conditions: goods must be returned in original condition
- Refund terms: full refund within 14 days of receiving returned goods
- Exceptions (customized or personalized goods, if applicable)
- Return shipping cost responsibility

#### 8.1.5 Informação sobre Resolução Alternativa de Litígios (Alternative Dispute Resolution)
**Legal basis:** Lei n.º 144/2015, Regulation (EU) 524/2013
**Content must include:**
- Statement that consumers can use ADR entities for disputes
- List of applicable Portuguese ADR entities (e.g., CNIACC - Centro Nacional de Informação e Arbitragem de Conflitos de Consumo)
- Note: The EU ODR platform (ec.europa.eu/consumers/odr) was discontinued in July 2023. Check current requirements with Direção-Geral do Consumidor for any replacement mechanism.

### 8.2 Required Links (Must Be Visible on All Pages)

These links must be present and accessible, typically in the footer:

| Link | URL | Legal Basis |
|---|---|---|
| **Livro de Reclamações Eletrónico** | https://www.livroreclamacoes.pt | DL 156/2005, DL 74/2017 |
| **Termos e Condições** | Internal page `/terms` | DL 7/2004 |
| **Política de Privacidade** | Internal page `/privacy` | GDPR, Lei 58/2019 |
| **Política de Cookies** | Internal page `/cookies` | Lei 46/2012 |
| **Devoluções e Reembolsos** | Internal page `/returns` | DL 24/2014 |
| **Resolução de Litígios** | Internal page `/disputes` | Lei 144/2015 |

### 8.3 Company Identification (Visible on Site)

Per DL 7/2004, the following must be displayed (e.g. in footer or a dedicated page):
- Legal company name or individual trader name
- NIF (Número de Identificação Fiscal)
- Registered address
- Contact email address
- Contact phone number (optional but recommended)

### 8.4 Implementation Plan

**Frontend changes:**

1. **Create legal page components:**
   - `frontend/src/screens/TermsScreen.jsx`
   - `frontend/src/screens/PrivacyScreen.jsx`
   - `frontend/src/screens/CookiesScreen.jsx`
   - `frontend/src/screens/ReturnsScreen.jsx`
   - `frontend/src/screens/DisputesScreen.jsx`

2. **Add routes in `App.js`:**
   - `/terms` -> TermsScreen
   - `/privacy` -> PrivacyScreen
   - `/cookies` -> CookiesScreen
   - `/returns` -> ReturnsScreen
   - `/disputes` -> DisputesScreen

3. **Update `Footer.jsx`:**
   - Add links to all legal pages
   - Add the Livro de Reclamações link (external, opens in new tab) with the official icon if available
   - Add company identification info (name, NIF, address, email)

4. **Update cookie consent banner** (`react-cookie-consent` in `App.js`):
   - Link the "learn more" to the `/cookies` page
   - Ensure it blocks non-essential cookies until consent is given

### 8.5 Important Notes

- Legal page content should be reviewed by a Portuguese lawyer before going live.
- The Livro de Reclamações link is **mandatory by law** and must be easily accessible (ideally with the official logo/icon).
- Failure to comply can result in fines from ASAE ranging from ~200 to ~44,000 EUR depending on the infraction.
- Check the current status of the EU ODR platform replacement with the Direção-Geral do Consumidor, as regulations may have evolved since mid-2023.

---

## Priority Order

| Priority | Section | Impact | Effort |
|---|---|---|---|
| **P0** | #6.1 - Server-side price recalculation | Price manipulation vulnerability | Low |
| **P0** | #6.2 - Auth on order endpoints | Unauthorized order access | Medium |
| **P0** | #6.3 - User data exposure | Password hash leakage | Low |
| **P0** | #6.4 - Hardcoded JWT secret | Auth bypass in production | Low |
| **P0** | #6.5 - Secure password reset | Account takeover | Medium |
| **P0** | #6.6 - Input validation | Crashes, injection, bad data | Medium |
| **P0** | #6.7 - Inventory race conditions | Overselling, incorrect stock | Medium |
| **P1** | #6.8 - Email endpoint security | Spam vector, lost emails | Medium |
| **P1** | #6.9 - Request body size limit | DoS via large payloads | Low |
| **P1** | #6.10 - Seed route protection | Production data wipe | Low |
| **P1** | #6.11 - Fix error handler | Silent server failures | Low |
| **P1** | #7 - CI/CD security stack | Ongoing vulnerability detection | Medium |
| **P2** | #6.12 - Email error responses | Invisible email failures | Low |
| **P2** | #8 - Portugal legal compliance | Legal fines, regulatory risk | Medium |
| **P2** | #4 - Frontend architecture | Maintenance, bundle size | High |
