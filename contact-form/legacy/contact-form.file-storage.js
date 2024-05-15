const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { v4: uuid } = require("uuid");
const { mongoConnectionString } = require("../../config");

const path = require("path");
const crypto = require("crypto");

const storage = new GridFsStorage({
  url: mongoConnectionString,
  file: (req, file) => {
    // console.log("FILE: ", file);
    // console.log("FILE IN STORAGE: ", file);

    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          console.log("ERR: ", err);
          return reject(err);
        }

        // console.log("FILE: ", file);
        // const filename = `${uuid()}_${file.originalname}`;
        const filename = `${uuid()}_${file.originalname}`;
        const fileInfo = {
          filename: filename,
          bucketName: "lipna.uploads",
        };

        resolve(fileInfo);
        // console.log("STORAGE FILENAME:", filename);
      });
    });
  },
});

const fileFilter = (req, file, cb) => {
  // dodać logike pdf, zdjec z apple itd
  if (file.mimetype === "image/jpeg") {
    cb(null, true); // Akceptuj plik
  } else {
    cb(null, false); // Odrzuć plik
    console.log("Wrong file type, file not saved i database");
  }
};

const limits = {
  fileSize: 40 * 1024 * 1024,
};

const upload = multer({ storage, limits, fileFilter });

module.exports = { upload };
