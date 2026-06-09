export const bookingConfirmation = ({ booking, hasInvoice = false }) => {
  const dateStr = new Date(booking.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const brand = process.env.BRAND_NAME || 'Sweevil';
  const homeUrl = process.env.VITE_HOME_PAGE || '';
  const contactEmail = process.env.VITE_SENDER_EMAIL_ADDRESS || '';

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
            ${
              process.env.BRAND_LOGO
                ? `<img src="${process.env.BRAND_LOGO}" alt="${brand}" width="150" style="display:block;margin:0 auto;" />`
                : `<span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:2px;">${brand}</span>`
            }
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
              ${
                booking.vatNif
                  ? `<tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Tax ID / VAT</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.vatNif}</span>
                </td>
              </tr>`
                  : ''
              }
            </tbody>
          </table>
          ${
            booking.images && booking.images.length > 0
              ? `
          <div style="margin-top:24px;">
            <p style="margin:0 0 10px;color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:bold;">Your Photos</p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody>
              ${(() => {
                const rows = [];
                for (let i = 0; i < booking.images.length; i += 3)
                  rows.push(booking.images.slice(i, i + 3));
                return rows
                  .map(
                    (row) =>
                      `<tr>${row.map((url) => `<td style="padding:4px;width:33.33%;vertical-align:top;"><a href="${url}" target="_blank" style="display:block;height:120px;overflow:hidden;border-radius:4px;border:1px solid #e0e0e0;"><img src="${url}" width="100%" height="120" style="display:block;width:100%;height:120px;object-fit:cover;" /></a></td>`).join('')}${
                        row.length < 3
                          ? Array(3 - row.length)
                              .fill('<td style="padding:4px;"></td>')
                              .join('')
                          : ''
                      }</tr>`
                  )
                  .join('');
              })()}
            </tbody></table>
          </div>`
              : ''
          }
          <p style="margin:20px 0 0;color:#767676;font-size:13px;font-style:italic;">
            Please note that the booking deposit is non-refundable.
          </p>
          ${
            hasInvoice
              ? `
          <p style="margin:24px 0 0;color:#555;font-size:14px;line-height:1.6;">
            Your invoice is attached to this email as a PDF.
          </p>`
              : ''
          }
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
                    Each design is a one-of-a-kind piece, drawn to measure with authenticity. To guarantee exclusivity, I do not repeat designs. If you are interested in a previous piece, you may send it as reference and I will create a new unique design inspired by it.
                  </p>
                  <p style="margin:0 0 12px;font-size:14px;color:#1a1a1a;font-weight:bold;">Important Booking Information:</p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                      ${[
                        [
                          'Deposit',
                          'Your booking is only confirmed after the deposit is paid. This amount will be deducted from the final tattoo cost.',
                        ],
                        ['Cancellations', 'Deposits are non-refundable in case of cancellation.'],
                        [
                          'Rescheduling',
                          "To keep your deposit, please give at least 3 days' notice for any rescheduling needs.",
                        ],
                        [
                          'Punctuality',
                          'Please be punctual. There is a 20-minute tolerance. After this time, the session will be automatically cancelled and the deposit forfeited.',
                        ],
                        [
                          'Companions',
                          'A maximum of one companion is allowed. Minors under 18 are not permitted in the studio.',
                        ],
                        [
                          'Preparation',
                          "Arrive well-fed and hydrated. The consumption of alcohol or other substances in the 24 hours before your session is strictly prohibited. A good night's sleep is essential.",
                        ],
                        [
                          'Clothing',
                          "Wear comfortable clothing that allows easy access to the area to be tattooed and that you don't mind potentially staining with ink.",
                        ],
                        [
                          'Health',
                          'Please contact us to reschedule if you have a fever, flu symptoms, or if the skin in the area to be tattooed is sunburned or irritated.',
                        ],
                      ]
                        .map(
                          ([label, text]) => `
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;width:110px;">
                          <strong style="color:#1a1a1a;font-size:13px;">${label}:</strong>
                        </td>
                        <td style="padding:6px 0;color:#555;font-size:13px;line-height:1.6;">${text}</td>
                      </tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>
                  <p style="margin:20px 0 0;color:#555;font-size:14px;line-height:1.6;">We look forward to seeing you soon!</p>
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
