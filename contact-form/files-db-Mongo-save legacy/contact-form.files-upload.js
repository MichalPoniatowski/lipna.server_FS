const formidable = require("formidable");
const { v4: uuid } = require("uuid");
const { Writable } = require("stream");

const { getGfs } = require("./contact-form.files-stream");
const { clearOrphantFiles } = require("./contact-form.files-cleanup");

const uploadFileMiddleware = (req, res, next) => {
  const gfs = getGfs();
  const form = new formidable.IncomingForm();
  form.multiples = true;
  form.keepExtensions = true;
  MAX_FILE_SIZE = 40 * 1024 * 1024;
  MAX_ATTACHMENTS_AMOUNT = 15;

  req.body = {};
  req.files = [];
  let uploadPromises = [];
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  const fileSizes = {};
  let fileNames = [];

  form.options.fileWriteStreamHandler = (file) => {
    if (!allowedTypes.includes(file.mimetype)) {
      console.error(`Unsupported type of file ${file.originalFilename}`);

      const blackHoleStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });
      return blackHoleStream;
    }

    fileNames.push(file.originalFilename);
    if (fileNames.length > MAX_ATTACHMENTS_AMOUNT) {
      const errorMessage = `Number of attachemnt over the limit of ${MAX_ATTACHMENTS_AMOUNT}`;
      console.log(
        `Number of attachemnt over the limit of ${MAX_ATTACHMENTS_AMOUNT}`
      );
      req.emit("error", new Error(errorMessage));
    }

    const filename = `${uuid()}_${file.originalFilename}`;
    const writeStream = gfs.openUploadStream(filename);
    fileSizes[filename] = 0;

    const countingStream = new Writable({
      write(chunk, encoding, callback) {
        fileSizes[filename] += chunk.length;

        if (fileSizes[filename] > MAX_FILE_SIZE) {
          const errorMessage = `File name: ${filename} exceeded size limit over ${
            MAX_FILE_SIZE / (1024 * 1024)
          } MB`;
          req.emit("error", new Error(errorMessage));
          callback();
          return;
        }

        writeStream.write(chunk, encoding, callback);
      },
      final(callback) {
        if (fileSizes[filename] <= MAX_FILE_SIZE) {
          writeStream.end(callback);
        } else {
          callback();
        }
      },
    });

    const uploadPromise = new Promise((resolve, reject) => {
      writeStream.on("error", (err) => {
        console.error(err);
        reject(err);
      });

      writeStream.on("finish", () => {
        console.log(
          `Total size of ${filename}:`,
          parseFloat((fileSizes[filename] / 1024 / 1024).toFixed(1)),
          "MB"
        );
        req.files.push({
          filename: filename,
          id: writeStream.id.toString(),
          size: parseFloat((fileSizes[filename] / 1024 / 1024).toFixed(1)),
        });
        resolve();
      });
    });

    uploadPromises.push(uploadPromise);
    return countingStream;
  };

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("An error occurred during the file upload: ", err);
      await clearOrphantFiles();
      return res.status(400).send({
        message: "An error occurred during the file upload: " + err.message,
      });
    }

    Object.keys(fields).forEach((key) => {
      req.body[key] = fields[key].length > 1 ? fields[key] : fields[key][0];
    });

    try {
      await Promise.all(uploadPromises);
      console.log("All files have been successfully saved.");
      next();
    } catch (error) {
      console.error("Error while saving files:", error);
      return res.status(400).send("Error processing files." + error.message);
    }
  });
};

module.exports = { uploadFileMiddleware };
