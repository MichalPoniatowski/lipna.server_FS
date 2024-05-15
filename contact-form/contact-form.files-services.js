const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { Writable } = require("stream");

const { ContactForm } = require("./contact-form.model");

const createAttachmentStream = (filePath) => {
  return fs.createReadStream(filePath);
};

const deleteFile = async (directoryPath) => {
  try {
    await fs.promises.unlink(directoryPath);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
};

const clearAndRemoveDirectory = async (directoryPath, writeStreams = []) => {
  await Promise.all(
    writeStreams.map((stream) => new Promise((resolve) => stream.end(resolve)))
  );
  try {
    const files = await fs.promises.readdir(directoryPath);
    for (const file of files) {
      await fs.promises.unlink(path.join(directoryPath, file));
    }
    await fs.promises.rmdir(directoryPath);
    console.log("Directory cleared and removed successfully.");
  } catch (error) {
    console.error("Failed to clear and remove directory:", error);
  }
};

const createFolderForFiles = async () => {
  try {
    const filesRootFolder = path.join(__dirname, "uploaded-files");
    const filesFolderName = `${uuid()}_${
      new Date().toISOString().split("T")[0]
    }_${new Date().toTimeString().split(" ")[0].replace(/:/g, "-")}`;
    const filesFolderPath = path.join(filesRootFolder, filesFolderName);
    await fs.promises.mkdir(filesFolderPath, { recursive: true });
    return filesFolderPath;
  } catch (error) {
    console.error(
      "Error during creating folder for contact-form",
      error.message
    );
  }
};

const isRequestOverLimitPerEmail = async (emailToCheck) => {
  const MAX_FORMS_PER_EMAIL = 20000;
  // ZMIENIĆ LIMIT
  let totalFormsPerEmail = 0;
  let isOverLimit = false;

  const matchingForm = await ContactForm.find(
    { email: emailToCheck },
    { email: 1, _id: 1 }
  );
  totalFormsPerEmail = matchingForm.length;

  if (totalFormsPerEmail >= MAX_FORMS_PER_EMAIL) {
    isOverLimit = true;
  }

  return isOverLimit;
};

const uploadFileMiddleware = async (req, res, next) => {
  const MAX_FILE_SIZE = 4 * 1024 * 1024;
  const MAX_ATTACHMENTS_AMOUNT = 6;
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "image/heic",
    "image/heif",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
  ];

  req.body = {};
  req.files = [];
  let filesInfoPromises = [];
  const writeStreams = [];
  let fileNames = [];
  let errorStatus = null;
  const formFilesFolderPath = await createFolderForFiles();
  req.body.files_dir = formFilesFolderPath;

  const form = new formidable.IncomingForm();
  form.multiples = true;
  form.keepExtensions = true;

  form.options.fileWriteStreamHandler = (file) => {
    if (!allowedTypes.includes(file.mimetype)) {
      errorStatus = 415;
      const errorMessage = `Un supported media type of file ${file.originalFilename}`;

      return new Writable({
        write: (chunk, encoding, callback) => {
          callback(new Error(errorMessage));
        },
      });
    }

    if (fileNames.length >= MAX_ATTACHMENTS_AMOUNT) {
      errorStatus = 413;
      const errorMessage = `Limit of ${MAX_ATTACHMENTS_AMOUNT} files exceeded`;

      return new Writable({
        write: (chunk, encoding, callback) => {
          callback(new Error(errorMessage));
        },
      });
    }

    fileNames.push(file.originalFilename);
    const filename = file.originalFilename;
    const filePath = path.join(formFilesFolderPath, filename);
    const writeStream = fs.createWriteStream(filePath);
    writeStreams.push(writeStream);

    let uploadedSize = 0;

    const uploadPromise = new Promise((resolve, reject) => {
      writeStream.on("error", reject);
      writeStream.on("finish", () => {
        console.log(
          `File ${filename} saved, size: ${uploadedSize / (1024 * 1024)} MB`
        );
        req.files.push({
          filename,
          path: filePath.toString(),
          size: parseFloat((uploadedSize / 1024 / 1024).toFixed(2)),
          mimeType: file.mimetype,
        });
        resolve();
      });
    });

    filesInfoPromises.push(uploadPromise);

    return new Writable({
      write: (chunk, encoding, callback) => {
        uploadedSize += chunk.length;
        if (uploadedSize > MAX_FILE_SIZE) {
          errorStatus = 413;
          const errorMessage = `File ${
            file.originalFilename
          } exceeded size limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`;

          callback(new Error(errorMessage));
          return;
        }
        writeStream.write(chunk, encoding, callback);
      },
      final: (callback) => {
        writeStream.end(callback);
      },
    });
  };

  form.parse(req, async (error, fields, files) => {
    if (error) {
      await clearAndRemoveDirectory(formFilesFolderPath, writeStreams);
      return res
        .status(errorStatus)
        .send("An error occurred during the file upload: " + error.message);
    }
    if (!req.files.length) {
      delete req.body.files_dir;
      await clearAndRemoveDirectory(formFilesFolderPath);
    }
    console.log("All files have been saved successfully.");

    try {
      if (fields.email[0]) {
        const email = fields.email[0];
        const isOverLimit = await isRequestOverLimitPerEmail(email);

        if (isOverLimit) {
          console.log("OVER LIMIT OF REQ PER EMAIL");
          await clearAndRemoveDirectory(formFilesFolderPath);
          return res
            .status(429)
            .send({ message: "Too many requests per email address" });
        }
      }

      await Promise.all(filesInfoPromises);
      Object.keys(fields).forEach((key) => {
        req.body[key] = fields[key].length > 1 ? fields[key] : fields[key][0];
      });

      console.log("All form req.body data processed successfully.");
      next();
    } catch (error) {
      return res
        .status(400)
        .send("Error processing req.body data: " + error.message);
    }
  });
};

module.exports = { uploadFileMiddleware };

module.exports = {
  clearAndRemoveDirectory,
  createAttachmentStream,
  uploadFileMiddleware,
  deleteFile,
};
