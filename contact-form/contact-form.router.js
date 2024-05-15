const { Router } = require("express");

const { uploadFileMiddleware } = require("./contact-form.files-services");
const { authMiddleware } = require("../auth/auth.middleware");
const {
  listContactFormsHandler,
  getContactFormHandler,
  addContactFormHandler,
  deleteContactFormHandler,
  updateContactFormHandler,

  getAllFilesHandler,
  getOneFileHandler,
  deleteAllFilesHandler,
  deleteOneFileHandler,
} = require("./contact-form.controllers");
const { contactFormValidateMiddleware } = require("./contact-form.validator");
const { checkSpace } = require("./contact-form.check-space");

const contactFormRouter = Router();

contactFormRouter.post(
  "/",
  checkSpace,
  uploadFileMiddleware,
  contactFormValidateMiddleware,
  addContactFormHandler
);
contactFormRouter.get("/", authMiddleware, listContactFormsHandler);
contactFormRouter.get("/:contactFormId", authMiddleware, getContactFormHandler);
contactFormRouter.delete(
  "/:contactFormId",
  authMiddleware,
  deleteContactFormHandler
);
contactFormRouter.patch(
  "/:contactFormId",
  authMiddleware,
  contactFormValidateMiddleware,
  updateContactFormHandler
);

contactFormRouter.get(
  "/files/:contactFormId",
  authMiddleware,
  getAllFilesHandler
);
contactFormRouter.get(
  "/files/:contactFormId/:fileId",
  authMiddleware,
  getOneFileHandler
);

contactFormRouter.delete(
  "/files/:contactFormId",
  authMiddleware,
  deleteAllFilesHandler
);
contactFormRouter.delete(
  "/files/:contactFormId/:fileId",
  authMiddleware,
  deleteOneFileHandler
);

module.exports = { contactFormRouter };
