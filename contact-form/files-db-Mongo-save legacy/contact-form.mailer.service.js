const { sendMail } = require("../mailer/mailer.service");
const { gmailMailer } = require("../config");
const { getDownloadStream } = require("./contact-form.files-stream");

// DODAĆ LISTĘ ZAŁACZNIKÓW, jezeli null to "brak"

const sendRequestCopyTo = async (email, form) => {
  let attachmentsListHtml = `<p>Dołączone pliki: brak</p>`;
  let attachments = [];

  if (form.files && form.files.length > 0) {
    const filesHtml = form.files
      .map((file) => `<li>${file.filename}</li>`)
      .join("");
    attachmentsListHtml = `<p>Dołączone pliki:</p><ul>${filesHtml}</ul>`;

    attachments = form.files.map((file) => {
      return {
        filename: file.filename,
        content: getDownloadStream(file.upload_id),
      };
    });
  }

  const mailOptions = {
    to: email,
    subject: gmailMailer
      ? `Nowy formularz kontaktowy od ${form.name}`
      : "Kopia formularza kontaktowego wysłana ze strony lipna.ink",
    text: `Cześć, poniżej kopia wysłanego formularza kontaktowego:
      Imię: ${form.name}
      Nazwisko: ${form.surname}
      Adres mailowy: ${form.email}
      Opis tatuażu: ${form.description}`,
    html: `<h2>Cześć ${
      form.name
    }, poniżej kopia wysłanego formularza kontaktowego:</h2>
      <br/>
      <ul>
        <li>Imię: ${form.name}</li>
        <li>Nazwisko: ${form.surname ? form.surname : "brak"}</li>
        <li>Adres mailowy: ${form.email}</li>      
        <li>Opis tatuażu: ${form.description}</li>
      </ul>
    ${attachmentsListHtml}`,
    attachments: attachments,
  };

  await sendMail(mailOptions);
};

module.exports = {
  sendRequestCopyTo,
};
