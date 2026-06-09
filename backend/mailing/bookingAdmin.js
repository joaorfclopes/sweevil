export const bookingAdmin = ({ booking }) => {
  const dateStr = new Date(booking.date).toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const brand = process.env.BRAND_NAME || 'Sweevil';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking</title>
</head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,sans-serif;">
  <table width="600" border="0" cellpadding="0" cellspacing="0" align="center"
    style="background:#ffffff;margin:0 auto;border-radius:4px;overflow:hidden;">
    <tbody>
      <tr>
        <td style="background:#1a1a1a;padding:24px;text-align:center;">
          ${
            process.env.BRAND_LOGO
              ? `<img src="${process.env.BRAND_LOGO}" alt="${brand}" width="150" style="display:block;margin:0 auto;" />`
              : `<span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:2px;">${brand}</span>`
          }
        </td>
      </tr>
      <tr>
        <td style="padding:40px 40px 24px;">
          <h1 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">A new booking was made!</h1>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#f9f9f9;border-radius:4px;padding:20px;margin-top:16px;">
            <tbody>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Guest</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.guestInfo.name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</strong><br/>
                  <a href="mailto:${booking.guestInfo.email}" style="color:#1a1a1a;font-size:15px;">${booking.guestInfo.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Phone</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.guestInfo.phone}</span>
                </td>
              </tr>
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
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Amount</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.price.toFixed(2)}€</span>
                </td>
              </tr>
              ${
                booking.guestInfo.notes
                  ? `<tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Notes</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.guestInfo.notes}</span>
                </td>
              </tr>`
                  : ''
              }
              ${
                booking.vatNif
                  ? `<tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">NIF / VAT</strong><br/>
                  <span style="color:#1a1a1a;font-size:15px;">${booking.vatNif}</span>
                </td>
              </tr>`
                  : ''
              }
              ${
                booking.images && booking.images.length > 0
                  ? `<tr>
                <td style="padding:8px 20px;">
                  <strong style="color:#767676;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Photos (${booking.images.length})</strong><br/>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;"><tbody>
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
                </td>
              </tr>`
                  : ''
              }
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
