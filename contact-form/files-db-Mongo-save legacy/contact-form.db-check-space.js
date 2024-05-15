const mongoose = require("mongoose");

const { ContactForm } = require("./contact-form.model");
const { deleteAttachments } = require("./contact-form.files-stream");
const { clearOrphantFiles } = require("./contact-form.files-cleanup");

const sizeLimit = 300;

const getOldestForm = async () => {
  try {
    const contactForms = await ContactForm.find(
      { files_total_size: { $gt: 0 } },
      { files: 1, files_total_size: 1, createdAt: 1, name: 1, email: 1 },
      { sort: { createdAt: 1 } }
    );

    console.log("POTENTIAL CONTACT FORMS IN MAKE SPACE", contactForms);

    // if (contactForms.length === 0) {
    //   console.log("No contact forms to delete");
    //   return null;
    // }

    return contactForms[0];
  } catch (error) {
    console.error("Error with getting oldestForm", error);
  }
};

const makeSpaceInDB = async (storage) => {
  try {
    // let storageLeft = await getStorageLeft();
    let storageLeft = storage;
    let oldestContactForm = await getOldestForm();
    if (!oldestContactForm) {
      console.log("No forms to delete.");
      return null;
    }
    const filesToDelete = oldestContactForm.files.map((file) => file.upload_id);

    while (storageLeft < sizeLimit) {
      const checkIsFormExisting = async (id) => {
        const form = await ContactForm.findById(id);
        console.log("FORM CHECKING", form);
      };
      // console.log(
      //   `STARTING DELETING FORM ${JSON.stringify(oldestContactForm, null, 2)}`
      // );
      console.log("OLDEST CONTACT FORM ID", oldestContactForm._id);
      console.log("ARRAY OF FILES TO BE DELETE: ", filesToDelete);

      console.log("FORM CHECK BEFORE DELETING:");
      await checkIsFormExisting(oldestContactForm._id);

      await ContactForm.findByIdAndDelete(oldestContactForm._id);
      console.log(
        "OLDEST CONTACT FORM ID AFTER DELETING",
        oldestContactForm._id
      );

      console.log("FORM CHECK AFTER DELETING:");
      await checkIsFormExisting(oldestContactForm._id);

      await deleteAttachments(filesToDelete);
      oldestContactForm = await getOldestForm();

      if (oldestContactForm) {
        storageLeft = await getStorageLeft();
      } else {
        console.log("No forms to delete. IN LOOP");
        return null;
      }
    }
  } catch (error) {
    console.error("Error with getting DB stats about storage size", error);
  }

  console.log("Finished deleting forms with attachments.");
};

const getStorageLeft = async () => {
  try {
    const db = mongoose.connection.db;
    const dbStats = await db.stats();
    const totalSize = dbStats.storageSize;
    const dataSize = 512;
    const storage = Math.floor(dataSize - totalSize / (1024 * 1024));

    console.log("DB STATS:", dbStats);
    console.log("TOTAL SIZE FROM DB", totalSize / (1024 * 1024));
    console.log(`SPACE LEFT ${storage} MB`);

    return storage;
  } catch (error) {
    console.error("Error with getting DB stats about storage size", error);
  }
};

const checkSpaceInDB = async (req, res, next) => {
  //   const db = mongoose.connection.db;

  try {
    //     const dbStats = await db.stats();
    //     const totalSize = dbStats.storageSize;
    //     const dataSize = dbStats.dataSize;
    //     const storageLeft = Math.floor((totalSize - dataSize) / (1024 * 1024));

    // await makeSpaceInDB(500);
    // await clearOrphantFiles();
    const storageLeft = await getStorageLeft();

    if (storageLeft < sizeLimit) {
      console.log("START CLEANING IN MAKING SPACE");
      console.log("SORAGE IN MAKING SPACE:", storageLeft);
      await makeSpaceInDB(storageLeft);
      await clearOrphantFiles();
    }
  } catch (error) {
    console.error("Error fetching collection stats", error);
    return res.status(400).send("Server error");
  }

  next();
};

module.exports = { checkSpaceInDB };
