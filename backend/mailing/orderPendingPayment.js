import { formatName } from "../utils.js";
import { getTax } from "./taxRates.js";

export const orderPendingPayment = ({ order, paymentUrl }) => {
  const brand = process.env.BRAND_NAME || "Sweevil";
  const homeUrl = process.env.VITE_HOME_PAGE || "";
  const contactEmail = process.env.VITE_SENDER_EMAIL_ADDRESS || "";
  const name = formatName(order.shippingAddress.fullName);

  const itemRows = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 20px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-right:12px;vertical-align:middle;">
                <img src="${item.image}" alt="${item.name}" width="60" height="60"
                  style="display:block;border-radius:4px;object-fit:cover;" />
              </td>
              <td style="vertical-align:middle;color:#1a1a1a;font-size:15px;">
                ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.qty}
              </td>
            </tr>
          </table>
        </td>
        <td style="padding:8px 20px;color:#1a1a1a;font-size:15px;text-align:right;vertical-align:middle;">
          ${(item.price * item.qty).toFixed(2)}€
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order placed at ${brand}</title>
</head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,sans-serif;">
  <table width="600" border="0" cellpadding="0" cellspacing="0" align="center"
    style="background:#ffffff;margin:0 auto;border-radius:4px;overflow:hidden;">
    <tbody>
      <tr>
        <td style="background:#1a1a1a;padding:24px;text-align:center;">
          <a href="${homeUrl}" style="text-decoration:none;">
            ${process.env.BRAND_LOGO
              ? `<img src="${process.env.BRAND_LOGO}" alt="${brand}" width="150" style="display:block;margin:0 auto;" />`
              : `<span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:2px;">${brand}</span>`}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:40px 40px 24px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Order placed at ${brand}</h1>
          <p style="margin:0 0 24px;color:#555;font-size:15px;">
            Hi ${name}, your order has been created and is waiting for payment.
            Click the button below to complete your purchase.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#f9f9f9;border-radius:4px;">
            <tbody>
              ${itemRows}
              <tr>
                <td colspan="2" style="padding:0 20px;">
                  <hr style="border:none;border-top:1px solid #e0e0e0;margin:8px 0;" />
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px;color:#555;font-size:14px;">Subtotal</td>
                <td style="padding:8px 20px;color:#555;font-size:14px;text-align:right;">${order.itemsPrice.toFixed(2)}€</td>
              </tr>
              ${(() => { const tax = getTax(order.shippingAddress.country, order.itemsPrice); return tax ? `<tr><td style="padding:8px 20px;color:#555;font-size:14px;">${tax.label} (${tax.display})</td><td style="padding:8px 20px;color:#555;font-size:14px;text-align:right;">${tax.amount.toFixed(2)}€</td></tr>` : ''; })()}
              <tr>
                <td style="padding:8px 20px;color:#555;font-size:14px;">Shipping</td>
                <td style="padding:8px 20px;color:#555;font-size:14px;text-align:right;">${order.shippingPrice.toFixed(2)}€</td>
              </tr>
              <tr>
                <td style="padding:8px 20px;color:#1a1a1a;font-size:16px;font-weight:700;">Total</td>
                <td style="padding:8px 20px;color:#1a1a1a;font-size:16px;font-weight:700;text-align:right;">${order.totalPrice.toFixed(2)}€</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align:center;margin:32px 0;">
            <a href="${paymentUrl}"
              style="background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:4px;font-size:15px;font-weight:600;display:inline-block;">
              Pay now
            </a>
          </div>
          <p style="margin:0;color:#999;font-size:13px;">
            This link is unique to your order. Do not share it with others.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0 0 8px;color:#999;font-size:13px;">
            Questions? Contact us at
            <a href="mailto:${contactEmail}" style="color:#555;text-decoration:none;">${contactEmail}</a>
          </p>
          <p style="margin:0;color:#bbb;font-size:12px;">${brand}® is a registered brand</p>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
};
