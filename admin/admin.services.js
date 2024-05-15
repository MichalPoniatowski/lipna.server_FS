const { v4: uuid } = require("uuid");

const { Admin } = require("./admin.model");

const createAdmin = async (adminData) => {
  try {
    const admin = await Admin.create({
      ...adminData,
      verified: false,
      verificationToken: uuid(),
    });
    // console.log("CREATE ADMIN", admin);
    return admin;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const getAdmin = async (filter) => {
  try {
    const admin = await Admin.findOne(filter);
    // console.log("GET ADMIN", admin);
    return admin;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const updateAdmin = async (email, adminData) => {
  try {
    const admin = await Admin.findOneAndUpdate({ email }, adminData);
    return admin;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const updateAdminPassword = async (email, newPassword, passwordToken) => {
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error("Admin not found");
    }
    admin.passwordToBeChanged = newPassword;
    admin.passwordVerificationToken = passwordToken;
    await admin.save();
    return admin;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

module.exports = {
  createAdmin,
  getAdmin,
  updateAdmin,
  updateAdminPassword,
};
