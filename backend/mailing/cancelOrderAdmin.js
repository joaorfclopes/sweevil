import { formatName } from "../utils.js";
import itemsDetails from "./itemsDetails.js";

export const cancelOrderAdmin = ({
  order: {
    orderId,
    orderDate,
    shippingAddress: { fullName, email, phoneNumber },
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
      <title>Cancel Order Admin Email</title>
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
                                  Refund Request
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
                                  Hi ${
                                    process.env.BRAND_NAME
                                  }, you recieved a refund request from ${formatName(
    fullName
  )}!
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
                                          }/cart/order/${orderId}"
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
                                                  text-decoration: none;
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
                                                  User details
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
                                                align="center"
                                                style="
                                                  border-top: solid #d0d0d0 1px;
                                                  font-size: 1px;
                                                "
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
                                                  Name: ${formatName(fullName)}
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
                                                    Email: ${email}
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
                                                    Phone Number: ${phoneNumber}
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
                                                  Access your PayPal Business account and refund ${totalPrice.toFixed(
                                                    2
                                                  )}€ to ${formatName(
    fullName
  )} here: 
                                                  ${
                                                    process.env
                                                      .PAYPAL_BUSINESS_LINK ||
                                                    "https://www.sandbox.paypal.com/activities"
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
                                                  sent
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
