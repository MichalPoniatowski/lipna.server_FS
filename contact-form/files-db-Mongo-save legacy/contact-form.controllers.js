const {
  listContactForms,
  getContactFormById,
  addContactForm,
  deleteContactForm,
  updateContactForm,
} = require("./contact-form.services");

const { sendRequestCopyTo } = require("./contact-form.mailer.service");
const { gmailMailer } = require("../config");

const listContactFormsHandler = async (req, res) => {
  try {
    const options = req.query;
    const contactForms = await listContactForms(options);
    res.status(200).send({ forms: contactForms });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .send({ message: "Error during getting contatct-forms from database" });
  }
};

const getContactFormHandler = async (req, res) => {
  try {
    const formId = req.params.contactFormId;
    const contactForm = await getContactFormById(formId);

    if (!contactForm) {
      return res.status(404).send({ message: "Not found" });
    }

    res.status(200).send({ contactForm });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const addContactFormHandler = async (req, res) => {
  try {
    // console.log("REQ.BODY IN HANDLER: ", req.body);
    const clientMail = req.body.email;
    const fileIds = req.files.map((file) => ({
      filename: file.filename,
      upload_id: file.id,
      file_size: file.size,
    }));

    let filesTotalSize = 0;
    filesTotalSize = req.files.reduce((acc, file) => acc + file.size, 0);

    const addedForm = await addContactForm({
      ...req.body,
      files: fileIds,
      files_total_size: filesTotalSize,
    });
    res
      .status(201)
      .send({ message: "Form added succesfully", form: addedForm });

    // await sendRequestCopyTo(gmailMailer, addedForm);
    // await sendRequestCopyTo(clientMail, addedForm);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const deleteContactFormHandler = async (req, res) => {
  try {
    const formId = req.params.contactFormId;
    const formToDelete = await getContactFormById(formId);

    if (!formToDelete) {
      return res.status(404).send({ message: "Not found" });
    }

    await deleteContactForm(formId);

    res.status(202).send({
      message: "Contact Form deleted succesfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const updateContactFormHandler = async (req, res) => {
  try {
    const formId = req.params.contactFormId;
    const contactForm = await getContactFormById(formId);
    const updateForm = { ...req.body };
    const updatedForm = await updateContactForm(formId, updateForm);

    if (!contactForm) {
      return res.status(404).send({ message: "Not found" });
    }

    if (!updateForm) {
      return res.status(400).send({ message: "Bad request" });
    }
    res
      .status(200)
      .send({ message: "Form updated succesfully", form: updatedForm });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  listContactFormsHandler,
  getContactFormHandler,
  addContactFormHandler,
  deleteContactFormHandler,
  updateContactFormHandler,
};
