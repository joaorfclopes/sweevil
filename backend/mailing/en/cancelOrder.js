import { formatName } from '../../utils.js';
import itemsDetails from '../itemsDetails.js';
import { getTax } from '../taxRates.js';

export const cancelOrder = ({
  order: {
    invoiceNumber,
    confirmToken,
    orderDate,
    isPaid,
    cancelledByAdmin,
    refundIssued,
    shippingDetails: { fullName, country },
    orderItems,
    itemsPrice,
    shippingPrice,
    totalPrice,
  },
}) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Order Cancelled</title>
    </head>
    <body style="margin: 0; padding: 0">
      <div
        marginheight="0"
        marginwidth="0"
        style="min-width: 100%; background-color: #ffffff"
      >
        <table
          width="640"
          border="0"
          cellpadding="0"
          cellspacing="0"
          bgcolor="#ffffff"
          align="center"
          style="table-layout: fixed; margin: 0 auto"
        >
          <tbody>
            <tr>
              <td height="24" style="font-size: 24px; line-height: 24px">
              </td>
            </tr>
          </tbody>
        </table>
        <table
          width="640"
          border="0"
          cellpadding="0"
          cellspacing="0"
          align="center"
          style="
            border-collapse: collapse;
            border-spacing: 0;
            font-size: 0;
            table-layout: fixed;
            margin: 0 auto;
            background-color: #eeeeee;
          "
        >
          <tbody>
            <tr>
              <td>
                <table
                  width="640"
                  height="64"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background-color: #2d2d2d;
                    padding-top: 10px;
                    padding-bottom: 10px;"
                >
                  <tbody>
                    <tr>
                      <td width="640" height="64" align="center">
                        <a
                          href="${process.env.VITE_HOME_PAGE}"
                          rel="noreferrer"
                          target="_blank"
                        >
                          <img
                            align="center"
                            width="150"
                            src="${process.env.BRAND_LOGO}"
                            alt="${process.env.BRAND_NAME}"
                            border="0"
                            style="display: block"
                            class="CToWUd"
                          />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table
                  width="640"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="background-color: #eeeeee"
                >
                  <tbody>
                    <tr>
                      <td width="20">&nbsp;</td>
                      <td width="600">
                        <table
                          width="600"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                          align="center"
                        >
                          <tbody>
                            <tr>
                              <td
                                height="24"
                                style="font-size: 24px; line-height: 24px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style="
                                  font-family: 'FuturaPTHeavy-Reg', Futura, Arial,
                                    sans-serif;
                                  color: #2d2d2d;
                                  text-transform: uppercase;
                                  font-weight: 700;
                                  font-size: 16px;
                                  line-height: 22px;
                                  letter-spacing: 0.6px;
                                "
                              >
                                <font
                                  face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                >
                                  Order Cancelled!
                                </font>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="12"
                                style="font-size: 12px; line-height: 12px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style="
                                  font-family: 'FuturaPTBook-Reg', Futura, Arial,
                                    sans-serif;
                                  color: #2d2d2d;
                                  font-size: 14px;
                                  line-height: 20px;
                                  letter-spacing: 0.6px;
                                "
                              >
                                <font
                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                >
                                  Hi ${formatName(fullName)}, your order has been cancelled!
                                </font>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="12"
                                style="font-size: 12px; line-height: 12px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style="
                                  font-family: 'FuturaPTBook-Reg', Futura, Arial,
                                    sans-serif;
                                  color: #2d2d2d;
                                  font-size: 14px;
                                  line-height: 20px;
                                  letter-spacing: 0.6px;
                                "
                              >
                                <font
                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                >
                                  Order No.: ${orderId}
                                </font>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="6"
                                style="font-size: 6px; line-height: 6px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style="
                                  font-family: 'FuturaPTBook-Reg', Futura, Arial,
                                    sans-serif;
                                  color: #2d2d2d;
                                  font-size: 14px;
                                  line-height: 20px;
                                  letter-spacing: 0.6px;
                                "
                              >
                                <font
                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                >
                                  Order date: ${orderDate}
                                </font>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="24"
                                style="font-size: 24px; line-height: 24px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <table
                                  width="264"
                                  align="center"
                                  cellpadding="0"
                                  cellspacing="0"
                                  border="0"
                                  style="
                                    border-collapse: collapse;
                                    border-spacing: 0;
                                    font-size: 0;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        align="center"
                                        width="264"
                                        style="
                                          background-color: #2d2d2d;
                                          padding-top: 10px;
                                          padding-bottom: 10px;
                                        "
                                      >
                                        <a
                                          href="${process.env.VITE_HOME_PAGE}/cart/order/${confirmToken}"
                                          style="
                                            color: #ffffff;
                                            font-family: 'FuturaPTHeavy-Reg',
                                              Futura, Arial, sans-serif;
                                            font-size: 12px;
                                            line-height: 20px;
                                            font-weight: 700;
                                            text-align: center;
                                            text-decoration: none;
                                            text-transform: uppercase;
                                            letter-spacing: 0.6px;
                                          "
                                          rel="noreferrer"
                                          target="_blank"
                                        >
                                          <font
                                            face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                          >
                                            Order Details
                                          </font>
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="24"
                                style="font-size: 24px; line-height: 24px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                            ${
                              isPaid
                                ? `<tr>
                              <td width="600" border="0">
                                <table
                                  width="100%"
                                  cellpadding="0"
                                  cellspacing="0"
                                  border="0"
                                  align="center"
                                  style="background-color: #ffffff"
                                >
                                  <tbody>
                                    <tr>
                                      <td width="20">&nbsp;</td>
                                      <td width="560">
                                        <table
                                          width="100%"
                                          cellpadding="0"
                                          cellspacing="0"
                                          border="0"
                                          align="center"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                height="24"
                                                style="
                                                  font-size: 24px;
                                                  line-height: 24px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTHeavy-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  text-transform: uppercase;
                                                  font-weight: 700;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                  letter-spacing: 0.6px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                                >
                                                  Refund
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="12"
                                                style="
                                                  font-size: 12px;
                                                  line-height: 12px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style="
                                                  border-top: solid #d0d0d0 1px;
                                                  font-size: 1px;
                                                  line-height: 1px;
                                                "
                                                width="100%"
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="12"
                                                style="
                                                  font-size: 12px;
                                                  line-height: 12px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTBook-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                  letter-spacing: 0.6px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                                >
                                                ${cancelledByAdmin && refundIssued ? 'Your order has been cancelled and a refund has been initiated. It should be reflected in your original payment method within 5 to 10 business days.' : cancelledByAdmin && !refundIssued ? 'Your order has been cancelled. No refund was issued for this order. If you have any questions, please contact us.' : 'Your order has been cancelled. This will be reviewed and any applicable refund will be processed.'}
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTBook-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                  letter-spacing: 0.6px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                                >
                                                We will contact you as soon as possible.
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTBook-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                  letter-spacing: 0.6px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                                >
                                                If you are still looking for other options, please let us know!
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="12"
                                                style="
                                                  font-size: 12px;
                                                  line-height: 12px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTBook-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                  letter-spacing: 0.6px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                                >
                                                For any questions or information, please contact us at: ${process.env.VITE_SENDER_EMAIL_ADDRESS}
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="24"
                                                style="
                                                  font-size: 24px;
                                                  line-height: 24px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td width="20">&nbsp;</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="24"
                                style="font-size: 24px; line-height: 24px"
                              >
                                &nbsp;
                              </td>
                            </tr>`
                                : ''
                            }
                            <tr>
                              <td width="600" border="0">
                                <table
                                  width="100%"
                                  cellpadding="0"
                                  cellspacing="0"
                                  border="0"
                                  align="center"
                                  style="background-color: #ffffff"
                                >
                                  <tbody>
                                    <tr>
                                      <td width="20">&nbsp;</td>
                                      <td width="560">
                                        <table
                                          width="100%"
                                          cellpadding="0"
                                          cellspacing="0"
                                          border="0"
                                          align="center"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                height="24"
                                                style="
                                                  font-size: 24px;
                                                  line-height: 24px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTHeavy-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  text-transform: uppercase;
                                                  font-weight: 700;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                  letter-spacing: 0.6px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                                >
                                                  ${orderItems.length} item(s)
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="12"
                                                style="
                                                  font-size: 12px;
                                                  line-height: 12px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style="
                                                  border-top: solid #d0d0d0 1px;
                                                  font-size: 1px;
                                                  line-height: 1px;
                                                "
                                                width="100%"
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="12"
                                                style="
                                                  font-size: 12px;
                                                  line-height: 12px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            ${itemsDetails(orderItems)}
                                            <tr>
                                              <td
                                                style="
                                                  border-top: solid #d0d0d0 1px;
                                                  font-size: 1px;
                                                  line-height: 1px;
                                                "
                                                width="100%"
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="12"
                                                style="
                                                  font-size: 12px;
                                                  line-height: 12px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTHeavy-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  text-transform: uppercase;
                                                  font-weight: 700;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                                >
                                                  Subtotal: ${itemsPrice.toFixed(2)}€
                                                </font>
                                              </td>
                                            </tr>
                                            ${(() => {
                                              const tax = getTax(country, itemsPrice);
                                              return tax
                                                ? `<tr><td align="left" style="font-family:'FuturaPTHeavy-Reg',Futura,Arial,sans-serif;color:#2d2d2d;text-transform:uppercase;font-weight:700;font-size:14px;line-height:20px;"><font face="'FuturaPTHeavy-Reg',Futura,Arial,sans-serif">${tax.label} (${tax.display}): ${tax.amount.toFixed(2)}€</font></td></tr>`
                                                : '';
                                            })()}
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTHeavy-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  text-transform: uppercase;
                                                  font-weight: 700;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                                >
                                                  Shipping:
                                                  ${shippingPrice && shippingPrice.toFixed(2)}€
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                align="left"
                                                style="
                                                  font-family: 'FuturaPTHeavy-Reg',
                                                    Futura, Arial, sans-serif;
                                                  color: #2d2d2d;
                                                  text-transform: uppercase;
                                                  font-weight: 700;
                                                  font-size: 14px;
                                                  line-height: 20px;
                                                "
                                              >
                                                <font
                                                  face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                                >
                                                  Total: ${totalPrice.toFixed(2)}€
                                                </font>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="24"
                                                style="
                                                  font-size: 24px;
                                                  line-height: 24px;
                                                "
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td width="20">&nbsp;</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="24"
                                style="font-size: 24px; line-height: 24px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style="
                                  font-family: 'FuturaPTBook-Reg', Futura, Arial,
                                    sans-serif;
                                  color: #2d2d2d;
                                  font-size: 12px;
                                  line-height: 20px;
                                  letter-spacing: 0.6px;
                                "
                              >
                                <font
                                  face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                                >
                                  Best regards,
                                </font>
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style="
                                  font-family: 'FuturaPTHeavy-Reg', Futura, Arial,
                                    sans-serif;
                                  color: #2d2d2d;
                                  font-size: 12px;
                                  line-height: 20px;
                                  letter-spacing: 0.6px;
                                  font-weight: 700;
                                "
                              >
                                <font
                                  face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                                >
                                  ${process.env.BRAND_NAME}
                                </font>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="24"
                                style="font-size: 24px; line-height: 24px"
                              >
                                &nbsp;
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td width="20">&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table
                  width="640"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="background-color: #2d2d2d"
                >
                  <tbody>
                    <tr>
                      <td width="20">&nbsp;</td>
                      <td width="600">
                        <table
                          width="600"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                          align="center"
                        >
                          <tbody>
                            <tr>
                              <td height="24" style="font-size: 24px; line-height: 24px">
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style="
                                  font-family: 'FuturaPTBook-Reg', Futura, Arial, sans-serif;
                                  color: #dddddd;
                                  font-size: 10px;
                                  line-height: 18px;
                                  letter-spacing: 0.6px;
                                "
                              >
                                <font face="'FuturaPTBook-Reg', Futura, Arial, sans-serif">
                                  For any questions or information, please contact us at: ${
                                    process.env.VITE_SENDER_EMAIL_ADDRESS
                                  }
                                </font>
                              </td>
                            </tr>
                            <tr>
                              <td
                                height="24"
                                style="
                                  font-size: 24px;
                                  line-height: 24px;
                                  border-bottom: 1px solid #525050;
                                "
                              >
                                &nbsp;
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td width="20">&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <table
          width="640"
          border="0"
          cellpadding="0"
          cellspacing="0"
          bgcolor="#ffffff"
          align="center"
          style="table-layout: fixed; margin: 0 auto"
        >
          <tbody>
            <tr>
              <td height="24" style="font-size: 24px; line-height: 24px">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>`;
};
