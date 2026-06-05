# TODO

## 1. Carrier selection modal when marking order as sent

When admin clicks "Mark as Sent" on an order, show a modal to select the carrier before confirming.

- Carriers: CTT (default), DPD, DHL, GLS
- Store selected carrier on the order
- Only after confirming in the modal should the order be marked as sent

---

## 2. Staging environment (optional)

- Create a staging app in Heroku
- Add a `staging` environment in GitHub Actions that deploys on push to a `staging` branch
