const { sendMail } = require("../mailer/mailer.service");

const sendAdminVerificationMail = async (email, verificationToken) => {
  console.log(verificationToken);
  const mailOptions = {
    to: email,
    subject: "Welcome to our site :)",
    text: `Hello! Please verify your account by visiting http://localhost:3000/admin/verify/${verificationToken}`,
    html: `<h2>Hello!</h2><br/>Please verify your account by clicking <a href="http://localhost:3000/admin/verify/${verificationToken}">here</a>!`,
  };
  await sendMail(mailOptions);
};

const sendNewPasswordVerificationMail = async (
  email,
  passwordVerificationToken
) => {
  const mailOptions = {
    to: email,
    subject: "Confirm password changing",
    text: `Hello! Please confirm chaning new password by visiting http://localhost:3000/admin/confirm-new-password/${passwordVerificationToken}`,
    html: `<h2>Hello!</h2><br/>Please confirm chaning new password by visiting <a href="http://localhost:3000/admin/confirm-new-password/${passwordVerificationToken}">here</a>!`,
  };
  await sendMail(mailOptions);
};
// ZMIENIĆ POTEM ADRES NA WŁAŚCIWY Z SERWERA ?

module.exports = {
  sendAdminVerificationMail,
  sendNewPasswordVerificationMail,
};
