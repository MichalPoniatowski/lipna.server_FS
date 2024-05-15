const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");

const { ContactForm } = require("./contact-form.model");
const { deleteAttachments } = require("./contact-form.files-services");

const { clearAndRemoveDirectory } = require("./contact-form.files-services");

const MAX_DISC_STORAGE_SIZE = 512;
const STORAGE_LEFT_LIMIT = 300;

const checkIsFormExisting = async (id) => {
  const form = await ContactForm.findById(id);
  if (form) {
    console.log("CONTACT FORM EXISTS");
  }
  if (!form) {
    console.log("CONTACT FORM DELETED");
  }
};

const getOldestForm = async () => {
  try {
    const oldestForm = await ContactForm.findOne(
      { files_total_size: { $gt: 0 } },
      {
        files_total_size: 1,
        createdAt: 1,
        name: 1,
        email: 1,
        files_dir: 1,
      },
      { sort: { createdAt: 1 } }
    );
    return oldestForm;
  } catch (error) {
    console.error("Error with getting oldestForm", error);
  }
};

const checkIsFolderExisting = async (folderPath) => {
  let folderExists;
  try {
    await fs.access(folderPath, fs.constants.F_OK);
    console.log("FOLDER EXISTS");
    return (folderExists = true);
  } catch (error) {
    console.error("FOLDER DOES NOT EXISTS");
    return (folderExists = false);
  }
};

const makeSpace = async (storage) => {
  try {
    let storageLeft = storage;
    let oldestContactForm = await getOldestForm();

    if (!oldestContactForm) {
      console.log("No forms to delete.");
      return null;
    }
    const filesFolderPathToDelete = oldestContactForm.files_dir;

    while (storageLeft < STORAGE_LEFT_LIMIT) {
      try {
        await ContactForm.findByIdAndDelete(oldestContactForm._id);
        console.log(
          "Contatct form deleted from DB successfully, next delete files from server"
        );
      } catch (error) {
        console.log("Error during deleting oldest form from DB");
      }

      try {
        const isFolderExisting = await checkIsFolderExisting(
          filesFolderPathToDelete
        );
        if (!isFolderExisting) {
          console.log(
            "No folder to delete, get another contact-form to delete"
          );
        }
        if (isFolderExisting) {
          await clearAndRemoveDirectory(filesFolderPathToDelete);
          console.log("Folder and files deleted");
        }
      } catch (error) {
        console.log("Error during deleting folder with files");
      }

      oldestContactForm = await getOldestForm();

      if (oldestContactForm) {
        storageLeft = await getStorageLeftByDB();
        console.log("Storage left afer deleting contact form:  ", storageLeft);
      } else {
        console.log("No forms to delete.");
        return null;
      }
    }
  } catch (error) {
    console.error(
      "Error with getting data from DB or error during deleting files.",
      error.message
    );
  }

  console.log("Finished deleting forms with attachments.");
};

const getStorageLeftByDB = async () => {
  try {
    let totalStorage = 0;
    const contactForms = await ContactForm.find(
      { files_total_size: { $gt: 0 } },
      { files_total_size: 1 }
    );
    contactForms.forEach((contact) => {
      totalStorage += contact.files_total_size;
    });

    return MAX_DISC_STORAGE_SIZE - totalStorage;
  } catch (error) {
    console.error("Error with getting storage size from DB", error.message);
  }
};

const getTotalStorageInServer = async () => {
  const rootFolderPath = path.join(__dirname, "uploaded-files");

  try {
    const folders = await fs.readdir(rootFolderPath);
    if (folders.length === 0) {
      console.log("NO FOLDERS");
      return 0;
    }

    let totalSize = 0;

    for (const folder of folders) {
      const folderPath = path.join(rootFolderPath, folder);
      const filesInFolder = await fs.readdir(folderPath, {
        withFileTypes: true,
      });

      for (const file of filesInFolder) {
        if (file.isFile()) {
          try {
            const filePath = path.join(folderPath, file.name);
            const stats = await fs.stat(filePath);
            totalSize += stats.size;
          } catch (error) {
            console.log(
              `Error in getting stats for ${file.name}: ${error.message}`
            );
          }
        }
      }
    }

    const totalSizeMB = parseFloat((totalSize / 1024 / 1024).toFixed(2));
    console.log("TOTAL SIZE", totalSizeMB);
    return totalSizeMB;
  } catch (error) {
    console.error("ERROR", error.message);
  }
};

const checkSpace = async (req, res, next) => {
  try {
    const storageLeft = await getStorageLeftByDB();
    console.log("STORAGE LEFT", storageLeft);
    console.log("STORAGE LIMIT", STORAGE_LEFT_LIMIT);

    if (storageLeft < STORAGE_LEFT_LIMIT) {
      await makeSpace(storageLeft);
    }
  } catch (error) {
    console.error("Error in checking storage space", error);
    return res.status(400).send("Server error");
  }
  next();
};

module.exports = { checkSpace };
