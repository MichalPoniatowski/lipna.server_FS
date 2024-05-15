const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { ObjectId } = mongoose.Types;

let gfs;
const getGfs = () => {
  if (!gfs && mongoose.connection.readyState === 1) {
    const dataBase = mongoose.connection.db;
    gfs = new GridFSBucket(dataBase, {
      bucketName: "lipna.uploads",
    });
  }
  console.log("GFS CONECTED");
  return gfs;
};

const getDownloadStream = (fileID) => {
  const bucket = getGfs();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileID));
};

// const uploadStream = (filename) => {
//   console.log("UPLOAD BUCKET FILENAME", filename);
//   const bucket = getGfs();
//   return bucket.openUploadStream(filename);
// };

const checkFilesExistence = async (filesIds) => {
  const db = mongoose.connection.db;
  const filesCollection = db.collection("lipna.uploads.files"); // Nazwa kolekcji metadanych
  const filesObjectsIds = filesIds.map((id) => new mongoose.Types.ObjectId(id));

  const existingFiles = await filesCollection
    .find({
      _id: { $in: filesObjectsIds },
    })
    .toArray();

  return existingFiles;
  // return existingFiles.map((file) => file._id.toString());
};

const deleteAttachments = async (filesIds) => {
  const gridFS = getGfs();

  const deletePromises = filesIds.map((id) => {
    const fileId = new mongoose.Types.ObjectId(id);
    return gridFS
      .delete(fileId)
      .then(() => {
        console.log("File successfully deleted:", fileId.toString());
        return fileId.toString(); // Zwróć identyfikator usuniętego pliku
      })
      .catch((err) => {
        console.error(
          "Error during file deletion by gridFS:",
          fileId.toString(),
          err
        );
        throw err; // Rzuć wyjątek, aby był obsługiwany w catch poniżej
      });
  });

  try {
    const results = await Promise.all(
      deletePromises.map((p) => p.catch((e) => e))
    );

    // Filtrowanie i logowanie udanych usunięć
    const successResults = results.filter(
      (result) => !(result instanceof Error)
    );
    console.log("Files successfully deleted:", successResults);

    // Filtrowanie i logowanie błędów
    const errorResults = results.filter((result) => result instanceof Error);
    console.log(
      "Errors during file deletion:",
      errorResults.map((e) => e.message)
    );

    return { success: successResults, errors: errorResults };
  } catch (error) {
    console.error("Unexpected error during files deletion:", error);
    throw error;
  }

  // const existingFilesIds = await checkFilesExistence(filesIds);
  // console.log("existing files to be deleted", existingFilesIds);

  // console.log("files OBJ to delete in stream", filesObjectsIds);

  // const deleteFilesPromise = filesObjectsIds.map((fileId) => {
  //   console.log("BEFORE PROMISE IN DELETE STREAM");
  //   return new Promise((resolve, reject) => {
  //     gridFS.delete(fileId, (err) => {
  //       if (err) {
  //         console.error("Error during deleting file by gridFS", err);
  //         reject(err);
  //       } else {
  //         console.log("File deleted successfully", fileId.toString());
  //         resolve(fileId);
  //       }
  //     });
  //   });
  // });

  // try {
  //   console.log("DELETE ARRAY PROMISES", deleteFilesPromise);
  //   const results = await Promise.all(deleteFilesPromise);
  //   console.log(
  //     "All files deleted successfully",
  //     results.map((result) => result.toString())
  //   );
  // } catch (error) {
  //   console.error("Error during deleting files in Promise", error);
  //   // return error;
  //   throw error;
  // }
};

module.exports = {
  getDownloadStream,
  // uploadStream,
  getGfs,
  deleteAttachments,
};

// const streamFileFromGridFS = (fileID, res) => {
//   const bucket = getGRidFSBucket();
//   const downloadStream = bucket.openDownloadStream(
//     mongoose.Types.ObjectId(fileID)
//   );

//   downloadStream.on("data", (chunk) => {
//     res.write(chunk);
//   });

//   downloadStream.on("error", (err) => {
//     console.error("Wystąpił błąd podczas strumieniowania pliku:", err);
//     res.status(500).send("Błąd podczas pobierania pliku");
//   });

//   downloadStream.on("end", () => {
//     res.end();
//   });
// };
