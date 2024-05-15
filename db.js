const mongoose = require("mongoose");
const { mongoConnectionString } = require("./config");

const connect = async () => {
  try {
    await mongoose.connect(mongoConnectionString);
  } catch (error) {
    console.log(error);
    throw new Error("Database connection failed");
  }
};

// const getDataBase = async () => {
//   if (mongoose.connection.readyState === 1) {
//     return mongoose.connection.db;
//   }
//   console.log("Database connection is not ready");
//   return null;
// };

const disconnect = async () => {
  try {
    await mongoose.disconnect(mongoConnectionString);
  } catch (error) {
    console.log(error);
    throw new Error("Could not disconnect from database");
  }
};

module.exports = {
  connect,
  disconnect,
  // getDataBase,
};
