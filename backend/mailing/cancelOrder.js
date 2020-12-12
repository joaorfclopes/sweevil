import itemsDetails from "./itemsDetails.js";

export const cancelOrder = ({
  userInfo: { userName },
  order: {
    orderId,
    orderDate,
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
      <title>Cancel Order Email</title>
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
                          href="${
                            process.env.HOME_PAGE || "http://localhost:3000"
                          }"
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
                                  Order Canceled!
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
                                  Hi ${userName}, your order was canceled!
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
                                          href="${
                                            process.env.HOME_PAGE ||
                                            "http://localhost:3000"
                                          }/order/${orderId}"
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
                                                  The Refund
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
                                                We have processed your refund and it should reflect in your PayPal account in the 2-3 business days!
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
                                                We'll be in contact with you as soon as possible.
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
                                                If you are still on the lookout for other options, please do let us know!
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
                                                For any questions or information please contact us at: ${
                                                  process.env
                                                    .SENDER_EMAIL_ADDRESS
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
                                                  Sub-Total: ${itemsPrice.toFixed(
                                                    2
                                                  )}€
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
                                                  Shipping:
                                                  ${shippingPrice.toFixed(2)}€
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
                                                  Total: ${totalPrice.toFixed(
                                                    2
                                                  )}€
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
                                  Thanks,
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
                                  For any questions or information please contact us at: ${
                                    process.env.SENDER_EMAIL_ADDRESS
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
