# TODO

## 1. Add billing details to the booking flow

Add a billing details step to `BookingScreen` (between the details form and payment), mirroring what already exists in `ShippingScreen`:
- Full billing address fields: full name, street, city, postal code, country
- "Same as contact info" checkbox (copies name from the contact step)
- Optional VAT/NIF field
- Store the billing data in component state and forward it to the booking creation payload

The booking flow becomes: **Calendar → Slots → Details → Billing → Payment**

---

## 2. Stepper for the order (shop) flow

Replace the current two-screen layout (`ShippingScreen` → `PlaceOrderScreen`) with a stepped flow. Build a reusable `CheckoutStepper` component (black filled bubbles, white text/numbers) and render it at the top of both screens.

Steps:
1. **Shipping** – contact info + shipping address (`/cart/shipping`)
2. **Billing** – billing address + VAT/NIF (same screen or its own `/cart/billing` route — TBD at implementation time, but keeping it as a separate step visually is mandatory)
3. **Review** – order summary before confirm (`/cart/placeorder`)

The stepper must show which step is active and which are completed. Completed steps should be navigable (clicking a completed step bubble goes back to it).

Style requirements: bubble background `#000`, bubble text `#fff`, active bubble has a visible ring/outline, connector line between steps.

---

## 3. Stepper for the booking flow

Add the same `CheckoutStepper` component (or a `BookingStepper` variant) to `BookingScreen`, rendered above the content area for every step except `CONFIRMED`.

Steps (map to the existing `STEPS` constants):
1. **Date** (`STEPS.CALENDAR`)
2. **Time** (`STEPS.SLOTS`)
3. **Details** (`STEPS.FORM`)
4. **Billing** (`STEPS.BILLING` — new step added in TODO #1)
5. **Payment** (`STEPS.PAYMENT`)

`CONFIRMED` is not a stepper step — it remains a standalone confirmation screen.

The active step indicator must stay in sync with the `step` state variable. Past steps are shown as completed; future steps are shown as inactive.
