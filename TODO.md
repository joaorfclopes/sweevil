# TODO

## 2. Billing address + VAT/NIF field on checkout + order screen

- Checkout/shipping page:
  - Add billing address section, defaulting to "same as shipping address" (checkbox)
  - When unchecked, show full address fields for billing
  - Add optional VAT/NIF field with tooltip explaining what it is per country (e.g. NIF in PT, VAT number in UK, CIF in ES, etc.)
- Order screen:
  - Show "Morada de Faturação" section below "Morada de Envio"
  - For already-paid orders with no billing address stored: display shipping address as billing address

---

## 3. Payment method section on order screen

- After order is paid, show "Método de Pagamento" section on order screen
- For already-paid orders with no payment method stored: infer from existing data or show a sensible fallback
