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
          ${booking.images && booking.images.length > 0 ? `
          <div style="margin-top:24px;">
            <p style="margin:0 0 10px;color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:bold;">Your Photos</p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr>
              ${booking.images.map((url) => `<td style="padding:4px;width:25%;vertical-align:top;"><a href="${url}" target="_blank"><img src="${url}" width="100" style="display:block;max-width:100%;border-radius:4px;border:1px solid #e0e0e0;" /></a></td>`).join("")}
            </tr></tbody></table>
          </div>` : ""}
          <p style="margin:24px 0 0;color:#555;font-size:14px;line-height:1.6;">
            If you have any questions, please contact us at
            <a href="mailto:${contactEmail}" style="color:#1a1a1a;">${contactEmail}</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="border-top:1px solid #e0e0e0;padding-top:32px;margin-top:8px;">
            <tbody>
              <tr>
                <td>
                  <h2 style="margin:0 0 4px;font-size:18px;color:#1a1a1a;">Tattoo Booking &amp; Policies</h2>
                  <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.7;">
                    Hi there! You are booking a tattoo session with Sweevil.<br/><br/>
                    Every design is an original, custom-drawn piece created with authenticity. To ensure exclusivity, I do not repeat designs. If you are interested in a previous piece, feel free to send it as a reference, and I will create a new, unique design inspired by it.
                  </p>
                  <p style="margin:0 0 12px;font-size:14px;color:#1a1a1a;font-weight:bold;">Important Booking Details:</p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                      ${[
                        ["Deposit", "Your appointment is only confirmed once the deposit is paid. This amount will be deducted from the final cost of your tattoo."],
                        ["Cancellations", "Deposits are non-refundable in the event of a cancellation."],
                        ["Rescheduling", "To keep your deposit, please provide at least 3 days' notice for any rescheduling needs."],
                        ["Punctuality", "Please be on time. There is a 20-minute grace period. After this time, the session will be automatically canceled and the deposit will be forfeited."],
                        ["Guests", "A maximum of one guest is allowed. No one under the age of 18 is permitted in the studio."],
                        ["Preparation", "Arrive well-fed and hydrated. The consumption of alcohol or other substances 24 hours prior to your appointment is strictly prohibited. A good night's sleep is essential."],
                        ["Clothing", "Please wear comfortable clothing that allows easy access to the area being tattooed and that you don't mind potentially getting ink on."],
                        ["Health", "Please reach out to reschedule if you have a fever, flu symptoms, or if the skin in the area to be tattooed is sunburned or irritated."],
                      ].map(([label, text]) => `
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;width:110px;">
                          <strong style="color:#1a1a1a;font-size:13px;">${label}:</strong>
                        </td>
                        <td style="padding:6px 0;color:#555;font-size:13px;line-height:1.6;">${text}</td>
                      </tr>`).join("")}
                    </tbody>
                  </table>
                  <p style="margin:20px 0 0;color:#555;font-size:14px;line-height:1.6;">Hope to meet you soon!</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#1a1a1a;padding:20px;text-align:center;">
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
