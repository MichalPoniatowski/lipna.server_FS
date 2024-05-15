const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    // match:
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    // match:
  },
  token: {
    type: String,
    default: null,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  passwordVerificationToken: {
    type: String,
    default: null,
  },
  passwordToBeChanged: {
    type: String,
    default: null,
    required: [false, "Password is required"],
    // match:
  },
});

adminSchema.pre("save", async function () {
  if (!this.password) {
    return;
  }
  if (this.password && this.passwordToBeChanged !== null) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.pre("save", async function () {
  if (!this.passwordToBeChanged) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordToBeChanged = await bcrypt.hash(this.passwordToBeChanged, salt);
});

adminSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Admin = new model("lipna.admins", adminSchema);

module.exports = {
  Admin,
};
