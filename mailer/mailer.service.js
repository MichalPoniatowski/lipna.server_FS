const nodemailer = require("nodemailer");
const { gmailPassword, gmailMailer } = require("../config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailMailer,
    pass: gmailPassword,
  },
});

const sendMail = async (options) => {
  try {
    await transporter.sendMail(options);
    console.log("Mail send successfully");
  } catch (e) {
    console.log(e);
    throw new Error("Mail sending falied");
  }
};

module.exports = {
  sendMail,
};

// const oauth2Client = new OAuth2(
//   clientId,
//   clientSecret,
//   "https://developers.google.com/oauthplayground"
// );

// oauth2Client.setCredentials({
//   refresh_token: refreshToken,
// });

// const createTransporter = async () => {
//   const accessTokenInfo = await oauth2Client.getAccessToken();
//   const accessToken = accessTokenInfo.token;

//   return nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       type: "OAuth2",
//       user: user,
//       clientId: clientId,
//       clientSecret: clientSecret,
//       refreshToken: refreshToken,
//       accessToken: accessToken,
//     },
//   });
// };

// // Użycie funkcji asynchronicznej do wysłania maila
// const sendMail = async (options) => {
//   try {
//     const transporter = await createTransporter();
//     await transporter.sendMail(options);
//   } catch (error) {
//     console.log(error);
//     throw new Error("Mail sending failed");
//   }
// };

// const {
//   gmailPassword,
//   gmailMailer,
// } = require("../config");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: gmailMailer,
//     pass: gmailPassword,
//   },
// });

// const sendMail = async (options) => {
//   try {
//     await transporter.sendMail(options);
//   } catch (error) {
//     console.log(error);
//     throw new Error("Mail sending falied");
//   }
// };
