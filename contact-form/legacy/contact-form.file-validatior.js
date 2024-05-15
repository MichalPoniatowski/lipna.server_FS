const busboy = require("busboy");
const { v4: uuidv4 } = require("uuid");

const validateFilesMiddleware = (req, res, next) => {
  try {
    if (req.method !== "POST") {
      return next(new Error("Method not allowed"));
    } else {
      const bb = busboy({
        headers: req.headers,
        limits: { files: 6, fileSize: 4 * 1024 * 1024 },
      });

      req.body = {};
      req.files = [];

      bb.on("field", (name, value) => {
        req.body[name] = value;
      });

      bb.on("file", (name, file, info) => {
        console.log(`Proccessing file ${name}: ${info.filename}`);
        // console.log("NAME:", name);
        //   console.log("FILE:", file);
        // console.log("INFO:", info);

        file.on("limit", () => {
          console.log(`File ${info.filename} is over size limit.`);
        });

        file.on("data", () => {
          req.files.push(file);
        });

        // file.on('data', )

        file.resume();
      });

      bb.on("filesLimit", () => {
        console.log("Limit over 6 files reached");
      });

      bb.on("finish", () => {
        // console.log("REQ BODY IN BB", req.body);
        console.log("REQ.FILES:", req.files.length);
        next();
      });

      req.pipe(bb);
    }
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: "Error in BB wrapper" });
  }
};

module.exports = { validateFilesMiddleware };
