const itemsDetails = (orderItems) =>
  orderItems.map((item) => {
    return `<tr>
    <td>
      <table width="560" cellpadding="0" cellspacing="0" border="0">
        <tbody>
          <tr>
            <td width="110" valign="top">
              <a
                href="${
                  process.env.HOME_PAGE || "http://localhost:3000"
                }/product/${item.product}"
                rel="noreferrer"
                target="_blank"
              >
                <img
                  src="${item.image}"
                  alt="product"
                  width="110"
                  border="0"
                  style="display: block"
                  class="CToWUd"
                />
              </a>
            </td>
            <td width="20">&nbsp;</td>
            <td width="430" valign="top">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tbody>
                  <tr>
                    <td align="left">
                      <span
                        style="
                          font-family: 'FuturaPTHeavy-Reg', Futura, Arial,
                            sans-serif;
                          color: #2d2d2d;
                          font-size: 10px;
                          line-height: 14px;
                          text-transform: uppercase;
                          letter-spacing: 0.8px;
                          font-weight: 700;
                        "
                      >
                        <font
                          face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                        >
                          Name:
                        </font>
                      </span>
                      <span
                        style="
                          font-family: 'FuturaPTBook-Reg', Futura, Arial,
                            sans-serif;
                          color: #2d2d2d;
                          font-size: 10px;
                          line-height: 14px;
                          letter-spacing: 0.6px;
                        "
                      >
                        <font
                          face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                        >
                          ${item.name}
                        </font>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td height="6" style="font-size: 6px; line-height: 6px">
                      &nbsp;
                    </td>
                  </tr>
                  ${
                    item.size !== "null" &&
                    `<tr>
                  <td align="left">
                    <span
                      style="
                        font-family: 'FuturaPTHeavy-Reg', Futura, Arial,
                          sans-serif;
                        color: #2d2d2d;
                        font-size: 10px;
                        line-height: 14px;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                        font-weight: 700;
                      "
                    >
                      <font
                        face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                      >
                        Size:
                      </font>
                    </span>
                    <span
                      style="
                        font-family: 'FuturaPTBook-Reg', Futura, Arial,
                          sans-serif;
                        color: #2d2d2d;
                        font-size: 10px;
                        line-height: 14px;
                        letter-spacing: 0.6px;
                      "
                    >
                      <font
                        face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                      >
                        ${item.size}
                      </font>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td height="6" style="font-size: 6px; line-height: 6px">
                    &nbsp;
                  </td>
                </tr>`
                  }
                  <tr>
                    <td align="left">
                      <span
                        style="
                          font-family: 'FuturaPTHeavy-Reg', Futura, Arial,
                            sans-serif;
                          color: #2d2d2d;
                          font-size: 10px;
                          line-height: 14px;
                          text-transform: uppercase;
                          letter-spacing: 0.8px;
                          font-weight: 700;
                        "
                      >
                        <font
                          face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                        >
                          Price:
                        </font>
                      </span>
                      <span
                        style="
                          font-family: 'FuturaPTBook-Reg', Futura, Arial,
                            sans-serif;
                          color: #2d2d2d;
                          font-size: 10px;
                          line-height: 14px;
                          letter-spacing: 0.6px;
                        "
                      >
                        <font
                          face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                        >
                          ${item.price.toFixed(2)}€
                        </font>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td height="6" style="font-size: 6px; line-height: 6px">
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td align="left">
                      <span
                        style="
                          font-family: 'FuturaPTHeavy-Reg', Futura, Arial,
                            sans-serif;
                          color: #2d2d2d;
                          font-size: 10px;
                          line-height: 14px;
                          text-transform: uppercase;
                          letter-spacing: 0.8px;
                          font-weight: 700;
                        "
                      >
                        <font
                          face="'FuturaPTHeavy-Reg', Futura, Arial, sans-serif"
                        >
                          Qty:
                        </font>
                      </span>
                      <span
                        style="
                          font-family: 'FuturaPTBook-Reg', Futura, Arial,
                            sans-serif;
                          color: #2d2d2d;
                          font-size: 10px;
                          line-height: 14px;
                          letter-spacing: 0.6px;
                        "
                      >
                        <font
                          face="'FuturaPTBook-Reg', Futura, Arial, sans-serif"
                        >
                          ${item.qty}
                        </font>
                      </span>
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
    <td height="12" style="font-size: 12px; line-height: 12px">&nbsp;</td>
  </tr>`;
  });

export default itemsDetails;
