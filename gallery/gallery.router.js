const { Router } = require("express");

const { authMiddleware } = require("../auth/auth.middleware");
const {
  getImagesHandler,
  getSingleImagesHandler,
  updateImageListHandler,
  addImagesHandler,
} = require("./gallery.controllers");

const { uploadFileMiddleware } = require("../cloud/cloud.files-services");

const galleryRouter = Router();

galleryRouter.get("/", getImagesHandler);

galleryRouter.get("/:imageId", getSingleImagesHandler);

galleryRouter.post("/", uploadFileMiddleware("gallery"), addImagesHandler);

galleryRouter.post(
  "/update_gallery",
  //   authMiddleware,
  updateImageListHandler
);

module.exports = { galleryRouter };
