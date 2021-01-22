export const resetPassword = ({ userInfo: { userId, email } }) => {
  const resetPasswordLink = `${process.env.REACT_APP_HOME_PAGE}/resetPassword/${userId} ${email}`;

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Password Email</title>
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
                          href="${process.env.REACT_APP_HOME_PAGE}"
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
                                Your password reset link is ready
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
                                Just click the link to reset it.
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
                                                Want to make your new password strong?
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
                                                The advice right now is to make your password a combination of three memorable but random words. Obvs, your password has to be personal just to you. But, it’s best not to use anything to do with ${process.env.BRAND_NAME}, your family or something about you that can easily be found on social media. Pick something unique for your ${process.env.BRAND_NAME} account and don’t use it anywhere else!
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
                                                          href="${resetPasswordLink}"
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
                                                            Reset Password
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
                                                Issue with the link?
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
                                                  Simply copy and paste this link into your browser instead: 
                                                  <a href="${resetPasswordLink}" style="color:#0770cf;text-decoration:underline;word-break:break-all" target="_blank">
                                                    <font face="'FuturaPTBook-Reg', Futura, Arial, sans-serif" style="word-break:break-all">
                                                      ${resetPasswordLink}
                                                    </font>
                                                  </a>
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
                                  For any questions or information please contact us at: ${process.env.SENDER_EMAIL_ADDRESS}
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
