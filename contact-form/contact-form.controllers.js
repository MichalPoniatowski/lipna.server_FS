const archiver = require("archiver");
const fs = require("fs");

const {
  listContactForms,
  getContactFormById,
  addContactForm,
  deleteContactForm,
  updateContactForm,
} = require("./contact-form.services");
const { sendRequestCopyTo } = require("./contact-form.mailer.service");
const { gmailMailer } = require("../config");
const {
  createAttachmentStream,
  clearAndRemoveDirectory,
  deleteFile,
} = require("./contact-form.files-services");

const listContactFormsHandler = async (req, res) => {
  try {
    const options = req.query;
    const contactForms = await listContactForms(options);
    res.status(200).send({ forms: contactForms });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Internal Server Error during getting contatct-forms from database: " +
        error.message,
    });
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
    res.status(500).send({
      message:
        "Internal Server Error during getting contact-form: " + error.message,
    });
  }
};

const addContactFormHandler = async (req, res) => {
  try {
    const clientMail = req.body.email;
    const fileIds = req.files.map((file) => ({
      filename: file.filename,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimeType,
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
    return res.status(500).send({
      message:
        "Internal Server Error during adding new contact-form: " +
        error.message,
    });
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

    res.status(204).send({
      message: "Contact Form deleted succesfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Internal Server Error during deleting contact-form: " + error.message,
    });
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
      return res
        .status(404)
        .send({ message: "Updated contatc-form not found" });
    }
    res
      .status(200)
      .send({ message: "Form updated succesfully", form: updatedForm });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Internal Server Error during contact-form updating: " + error.message,
    });
  }
};

const getAllFilesHandler = async (req, res) => {
  try {
    const formId = req.params.contactFormId;
    const contactForm = await getContactFormById(formId);
    if (!contactForm) {
      return res.status(404).send({ message: "Form not found" });
    }

    const files = contactForm.files;
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });
    res.writeHead(200, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=${contactForm.name}_files.zip`,
    });
    archive.pipe(res);
    files.forEach((file) => {
      archive.file(file.file_path, { name: file.filename });
    });

    archive.on("error", (error) => {
      if (!res.headersSent) {
        console.error("Archiver error:", error);
        res.status(500).send({
          message:
            "Internal Server Error during archiving files: " + error.message,
        });
      }
    });

    archive.on("end", () => {
      console.log(
        "Archiver has been finalized and the output file descriptor has closed."
      );
    });

    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Internal Server Error during sending zipped files:" + error.message,
    });
  }
};

const getOneFileHandler = async (req, res) => {
  try {
    const formId = req.params.contactFormId;
    const fileId = req.params.fileId;
    const disposition = req.query.download ? "attachment" : "inline";
    const contactForm = await getContactFormById(formId);
    if (!contactForm) {
      return res.status(404).send({ message: "Form not found" });
    }

    const filesArray = contactForm.files;
    const fileData = filesArray.find((file) => file._id.toString() === fileId);
    if (!fileData) {
      return res.status(404).send({ message: "File not found" });
    }

    res.writeHead(200, {
      "Content-Type": fileData.mime_type,
      "Content-Disposition": `${disposition}; filename=${fileData.filename}`,
    });

    const fileStream = createAttachmentStream(fileData.file_path);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error sending file", error.message);
      res.status(500).send({
        message: "Internal Server Error with file stream: " + error.message,
      });
    });

    fileStream.on("end", () => {
      console.log("Files has been send successfully.");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error could not send file: " + error.message,
    });
  }
};

const deleteAllFilesHandler = async (req, res) => {
  try {
    const formId = req.params.contactFormId;
    const contactForm = await getContactFormById(formId);
    if (!contactForm) {
      return res.status(404).send({ message: "Form not found" });
    }

    const folderPath = contactForm.files_dir;
    if (!folderPath) {
      return res.status(404).send({ message: "No folder with that directory" });
    }

    await clearAndRemoveDirectory(folderPath);
    const updatedForm = await updateContactForm(formId, {
      files: [],
      files_total_size: 0,
      files_dir: null,
    });

    res.status(204).send({
      message: "Folder deleted and form updated succesfully",
      form: updatedForm,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error could not delete files: " + error.message,
    });
  }
};

const deleteOneFileHandler = async (req, res) => {
  try {
    const formId = req.params.contactFormId;
    const fileId = req.params.fileId;
    const contactForm = await getContactFormById(formId);
    if (!contactForm) {
      return res.status(404).send({ message: "Form not found" });
    }

    const filesArray = contactForm.files;
    const fileData = filesArray.find((file) => file._id.toString() === fileId);
    const filePath = fileData.file_path;
    if (!fileData) {
      return res.status(404).send({ message: "File not found" });
    }

    await deleteFile(filePath);
    const updatedFilesArray = filesArray.filter(
      (file) => file._id.toString() !== fileId
    );
    const updatedFilesTotalSize = updatedFilesArray.reduce(
      (acc, file) => acc + file.file_size,
      0
    );

    const updatedForm = await updateContactForm(formId, {
      files: updatedFilesArray,
      files_total_size: updatedFilesTotalSize,
    });

    res.status(204).send({
      message: "File deleted and form updated succesfully",
      form: updatedForm,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error could not delete file: " + error.message,
    });
  }
};

module.exports = {
  listContactFormsHandler,
  getContactFormHandler,
  addContactFormHandler,
  deleteContactFormHandler,
  updateContactFormHandler,

  getAllFilesHandler,
  getOneFileHandler,
  deleteAllFilesHandler,
  deleteOneFileHandler,
};
