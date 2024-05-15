const { Router } = require("express");

const { uploadFileMiddleware } = require("./contact-form.files-upload");
const { authMiddleware } = require("../auth/auth.middleware");
const {
  listContactFormsHandler,
  getContactFormHandler,
  addContactFormHandler,
  deleteContactFormHandler,
  updateContactFormHandler,
} = require("./contact-form.controllers");
const { contactFormValidateMiddleware } = require("./contact-form.validator");
const { checkSpaceInDB } = require("./contact-form.db-check-space");

const contactFormRouter = Router();

contactFormRouter.post(
  "/",
  checkSpaceInDB,
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

module.exports = { contactFormRouter };
