import nodemailer from "nodemailer";

let _etherealAccount = null;

const getTransporter = async () => {
  if (process.env.MAILING_SERVICE_CLIENT_ID) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.VITE_SENDER_EMAIL_ADDRESS,
        clientId: process.env.MAILING_SERVICE_CLIENT_ID,
        clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
        refreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
        accessToken: process.env.MAILING_SERVICE_ACCESS_TOKEN,
      },
    });
  }
  if (!_etherealAccount) {
    _etherealAccount = await nodemailer.createTestAccount();
    console.log(`[email] Ethereal test account: ${_etherealAccount.user}`);
    console.log("[email] View sent emails at: https://ethereal.email/messages");
  }
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: _etherealAccount.user, pass: _etherealAccount.pass },
  });
};

export const sendMail = async (mailOptions) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[email] Preview: ${previewUrl}`);
  } catch (err) {
    console.error("[email] ERROR:", err.message);
  }
};
