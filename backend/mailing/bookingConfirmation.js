export const bookingConfirmation = ({ booking }) => {
  const dateStr = new Date(booking.date).toLocaleDateString("pt-PT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const brand = process.env.BRAND_NAME || "Sweevil";
  const homeUrl = process.env.VITE_HOME_PAGE || "";
  const contactEmail = process.env.VITE_SENDER_EMAIL_ADDRESS || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="600" border="0" cellpadding="0" cellspacing="0" align="center"
    style="background:#ffffff;margin:32px auto;border-radius:4px;overflow:hidden;">
    <tbody>
      <tr>
        <td style="background:#1a1a1a;padding:24px;text-align:center;">
          <a href="${homeUrl}" style="color:#ffffff;font-size:22px;font-weight:700;text-decoration:none;letter-spacing:2px;">
            ${brand}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:40px 40px 24px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Booking Confirmed!</h1>
          <p style="margin:0 0 24px;color:#555;font-size:15px;">
            Hi ${booking.guestInfo.name}, your booking has been confirmed and payment received.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#f9f9f9;border-radius:4px;padding:20px;">
            <tbody>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Date</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${dateStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Time</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.slot}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Amount Paid</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.price.toFixed(2)}€</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p style="margin:24px 0 0;color:#555;font-size:14px;line-height:1.6;">
            If you have any questions, please contact us at
            <a href="mailto:${contactEmail}" style="color:#1a1a1a;">${contactEmail}</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f4f4;padding:20px;text-align:center;">
          <p style="margin:0;color:#999;font-size:12px;">
            &copy; ${new Date().getFullYear()} ${brand}
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
};
