const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { ContactForm } = require("./contact-form.model");

const getAllAttachemntsIds = async () => {
  try {
    let allAttachemntsIds = [];

    const contactForms = await ContactForm.find({}, { files: 1, _id: 0 });
    allAttachemntsIds = contactForms.flatMap((item) =>
      item.files.map((file) => file.upload_id)
    );

    return allAttachemntsIds;
  } catch (error) {
    console.error("Error fetching contact forms ids", error);
    return [];
  }
};

const findOrphanedFiles = async () => {
  let orphanedFilesIds = [];
  const db = mongoose.connection.db;
  const filesCollection = db.collection("lipna.uploads.files");

  const attachemntsIds = await getAllAttachemntsIds();
  const attachemntsObjectsIds = attachemntsIds.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const orphanedFiles = await filesCollection
    .find({ _id: { $nin: attachemntsObjectsIds } }, { projection: { _id: 1 } })
    .toArray();
  orphanedFilesIds = orphanedFiles.map((file) => file._id);

  return orphanedFilesIds;
};

const findOrphanedChunks = async () => {
  let orphanChunksIds = [];
  const db = mongoose.connection.db;
  const filesCollection = db.collection("lipna.uploads.files");
  const chunksCollection = db.collection("lipna.uploads.chunks");

  const filesIds = await filesCollection
    .find({}, { projection: { _id: 1 } })
    .toArray();
  const filesIdsArray = filesIds.map((file) => file._id);

  const orphanChunks = await chunksCollection
    .find({
      files_id: { $nin: filesIdsArray },
    })
    .toArray();

  orphanChunksIds = orphanChunks.map((chunk) => chunk._id);
  return orphanChunksIds;
};

const clearOrphantFiles = async () => {
  console.log("START CLEANING");
  const db = mongoose.connection.db;

  if (!db) {
    console.log("Database connection not established yet .");
    return null;
  }

  const filesCollection = db.collection("lipna.uploads.files");
  const orphanedFilesArray = await findOrphanedFiles();

  if (orphanedFilesArray.length > 0) {
    try {
      console.log("ORPHANT FILES", orphanedFilesArray.length);
      await filesCollection.deleteMany({
        _id: { $in: orphanedFilesArray },
      });
    } catch (error) {
      console.error("Error during deleting orphant files", error);
    }
  }

  const chunksCollection = db.collection("lipna.uploads.chunks");
  const orphanedChunksArray = await findOrphanedChunks();

  if (orphanedChunksArray.length > 0) {
    try {
      console.log("ORPHANT CHUNKS", orphanedChunksArray.length);
      await chunksCollection.deleteMany({
        _id: { $in: orphanedChunksArray },
      });
    } catch (error) {
      console.error("Error during deleting orphant chunks", error);
    }
  } else {
    console.log("NO FILES OR CHUNKS TO DELETE");
  }

  const check = async () => {
    const areOrphanedFilesArray = await findOrphanedFiles();
    console.log("ARE ORPHANT FILES", areOrphanedFilesArray.length);
    const areOrphanedChunksArray = await findOrphanedChunks();
    console.log("ARE ORPHANT chunks", areOrphanedChunksArray.length);
  };

  await check();
};

module.exports = {
  clearOrphantFiles,
};
