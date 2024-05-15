const fs = require("fs");
const path = require("path");

const {
  getImagesPaginatedList,
  updateManulayImagesList,
  getOneImage,
  getAllImagestList,
} = require("./gallery.services");

const galleryFolder = path.join(__dirname, "images");

const getImagesHandler = async (req, res) => {
  try {
    const options = req.query;
    const imagesList = await getImagesPaginatedList(options);
    //     const imagesList = await getAllImagestList();
    console.log("IMAGES FROM CONTROLLER", imagesList);
    res.status(200).send({ images: imagesList });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Internal Server Error during getting imagesList from database: " +
        error.message,
    });
  }
};

const updateImageListHandler = async (req, res) => {
  try {
    await updateManulayImagesList();
    res.status(200).send({ message: "Updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Internal Server Error during updating images list in DB: " +
        error.message,
    });
  }
};

const getSingleImagesHandler = async (req, res) => {
  try {
    const fileId = req.params.imageId;
    const image = await getOneImage(fileId);

    if (!image) {
      console.log("No image with that id");
      res.status(404).send({ message: "Image not found in DB" });
    }

    res.writeHead(200, {
      "Content-Type": `${image.mime_type}`,
      "Content-Disposition": `"attachment"; filename=${image.image_name}`,
    });

    const imagePath = image.image_dir;
    const imageStream = fs.createReadStream(imagePath);
    imageStream.pipe(res);

    imageStream.on("error", (error) => {
      console.error("Error sending file", error.message);
      res.status(500).send({
        message: "Internal Server Error with file stream: " + error.message,
      });
    });

    imageStream.on("end", () => {
      console.log("Image has been send successfully.");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error could not send file: " + error.message,
    });
  }
};

const addImagesHandler = async (req, res) => {};

module.exports = {
  getImagesHandler,
  getSingleImagesHandler,
  updateImageListHandler,
  addImagesHandler,
};
