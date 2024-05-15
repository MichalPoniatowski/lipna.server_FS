const fs = require("fs");
const path = require("path");
const mimeTypes = require("mime-types");

const { Image } = require("./gallery.model");

const galleryFolder = path.join(__dirname, "images");

const getImagesPaginatedList = async (options) => {
  try {
    const { page, limit } = options;
    const paginationOptions = {
      limit: limit || 15,
      page: page || 1,
    };

    const gallery = await Image.paginate({}, paginationOptions);
    return gallery;
  } catch (error) {
    const errorMessage = "Could not get images from database: ";
    console.error(errorMessage, error.message);
    throw new Error(errorMessage);
  }
};

const getAllImagestList = async () => {
  try {
    const imagesData = await Image.find();
    return imagesData;
  } catch (error) {
    console.error("Could not get images data from DB: ", error.message);
    return [];
  }
};

const getOneImage = async (imageId) => {
  try {
    const imageData = await Image.findOne({ _id: imageId });
    return imageData;
  } catch (error) {
    const errorMessage = "Could not find image data in DB: ";
    console.error(errorMessage, error.message);
    throw new Error(errorMessage);
  }
};

const getImagesDatafromServer = async () => {
  let imagesData = [];
  try {
    const images = await fs.promises.readdir(galleryFolder);
    for (const image of images) {
      const filePath = path.join(galleryFolder, image).toString();
      const mimeType = mimeTypes.lookup(filePath);
      const imageName = image;
      imagesData.push({
        image_name: imageName,
        image_dir: filePath,
        mime_type: mimeType,
      });
    }
  } catch (error) {
    const errorMessage = "Failed to read directory:";
    console.error(errorMessage, error.message);
    throw new Error(errorMessage, error.message);
  }
  console.log("IMAGES DATA FROM SERVER FOLDER", imagesData);
  return imagesData;
};

const addImages = async (arrayOfImages) => {
  try {
    const newImages = await Image.insertMany(arrayOfImages);
    console.log("All images data added successfully to DB", newImages);
    return newImages;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to save images data in DB:", error.message);
  }
};

const updateManulayImagesList = async () => {
  try {
    const imagesDataToUpdate = await getImagesDatafromServer();
    try {
      await Image.deleteMany({});
      console.log("Images deleted successfully");
    } catch (error) {
      console.error(error.message);
      throw new Error("Failed to delete images in DB:", error.message);
    }

    const updatedImagesList = await addImages(imagesDataToUpdate);
    console.log("Images list updated in DB:", updatedImagesList);
    return updatedImagesList;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getImagesPaginatedList,
  updateManulayImagesList,
  getOneImage,
  getAllImagestList,
};
