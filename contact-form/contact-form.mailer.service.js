const { sendMail } = require("../mailer/mailer.service");
const { gmailMailer } = require("../config");
const { createAttachmentStream } = require("./contact-form.files-services");

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
        content: createAttachmentStream(file.file_path),
      };
    });
  }

  let htmlContent;
  if (email === gmailMailer) {
    htmlContent = `<h2>Formularz kontaktowy od ${form.name}:</h2>
      <br/>
      <ul>
        <li>Imię: ${form.name}</li>
        <li>Nazwisko: ${form.surname ? form.surname : "brak"}</li>
        <li>Adres mailowy: ${form.email}</li>
        <li>Opis tatuażu: ${form.description}</li>
      </ul>
      ${attachmentsListHtml}`;
  } else {
    htmlContent = `<h2>Cześć ${
      form.name
    }, oto kopia Twojego formularza kontaktowego:</h2>
      <br/>
      <ul>
        <li>Imię: ${form.name}</li>
        <li>Nazwisko: ${form.surname ? form.surname : "brak"}</li>
        <li>Adres mailowy: ${form.email}</li>
        <li>Opis tatuażu: ${form.description}</li>
      </ul>
      ${attachmentsListHtml}`;
  }

  const mailOptions = {
    to: email,
    subject:
      email === gmailMailer
        ? `Nowy formularz kontaktowy od ${form.name}`
        : "Kopia formularza kontaktowego",
    text: `Cześć, poniżej znajduje się kopia Twojego formularza kontaktowego:
      Imię: ${form.name}
      Nazwisko: ${form.surname}
      Adres mailowy: ${form.email}
      Opis tatuażu: ${form.description}`,
    html: htmlContent,
    attachments: attachments,
  };

  await sendMail(mailOptions);
};

module.exports = { sendRequestCopyTo };
