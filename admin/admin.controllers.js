const JWT = require("jsonwebtoken");

const { generateAccessToken } = require("../auth/auth.service");
const { jwtLifetime, jwtPasswordLifetime } = require("../config");
const {
  createAdmin,
  getAdmin,
  updateAdmin,
  updateAdminPassword,
} = require("./admin.services");
const {
  sendAdminVerificationMail,
  sendNewPasswordVerificationMail,
} = require("./admin.mailer.service");
const { verifyToken } = require("../auth/auth.service");

const registerHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const createdAdmin = await createAdmin({ email, password });

    await sendAdminVerificationMail(
      createdAdmin.email,
      createdAdmin.verificationToken
    );

    return res.status(201).send({
      message:
        "Admin created succesfully, please chcek your email for verify account",
      admin: createdAdmin.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const passwordHandler = async (req, res) => {
  try {
    const admin = await getAdmin({ email: req.body.email });
    if (!admin) {
      return res.status(401).send({ message: "Wrong credentials." });
    }
    if (admin.verified === false) {
      return res.status(401).send({ message: "Admin account not verified." });
    }

    const newPassword = req.body.password;

    const passwordToken = generateAccessToken(
      { email: admin.email },
      jwtPasswordLifetime
    );

    await updateAdminPassword(admin.email, newPassword, passwordToken);
    const updatedAdmin = await getAdmin({ email: req.body.email });
    await sendNewPasswordVerificationMail(
      updatedAdmin.email,
      updatedAdmin.passwordVerificationToken
    );

    console.log("NEW PASSWORD PAYLOAD", req.body.password);

    return res.status(200).send({
      message:
        "To confirm changing new password, please chceck your mail and confirm, link is valid for 30 minutes",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const loginHandler = async (req, res) => {
  try {
    const admin = await getAdmin({ email: req.body.email });

    if (!admin) {
      return res.status(401).send({ message: "Wrong credentials." });
    }
    console.log("Loging with password:", req.body.password);

    const isAdminPasswordValid = await admin.validatePassword(
      req.body.password
    );

    if (!isAdminPasswordValid) {
      return res.status(401).send({ message: "Wrong credentials. password" });
    }

    if (admin.verified === false) {
      return res.status(401).send({ message: "Admin account not verified." });
    }

    const payload = {
      _id: admin._id,
      email: admin.email,
    };

    const token = generateAccessToken(payload, jwtLifetime);
    await updateAdmin(admin.email, { token: token });
    const updatedadmin = await getAdmin({ email: req.body.email });

    return res.status(200).send({
      message: "Logged sucessfully",
      admin: updatedadmin.email,
      token: updatedadmin.token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const logoutHandler = async (req, res) => {
  try {
    const admin = await getAdmin({ email: req.body.email });
    if (!admin) {
      return res.status(401).send({ message: "Wrong credentials." });
    }

    await updateAdmin(admin.email, { token: null });

    console.log("ADMIN ENTITY:", typeof admin);
    console.log("ADMIN ENTITY EMAIL:", typeof admin.email);

    return res.status(200).send({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// DO USUNIĘCIA PÓŹNIEJ
const verifyAdminHandler = async (req, res) => {
  try {
    const admin = await getAdmin({
      verificationToken: req.params.verificationToken,
    });

    if (!admin) {
      return res
        .status(400)
        .send({ message: "Invalid verification token or admin not found" });
    }
    if (admin.verified) {
      return res.status(200).send({ message: "Admin verified allready" });
    }

    await updateAdmin(admin.email, {
      verified: true,
      verificationToken: null,
    });

    return res.status(200).send({ message: "Admin verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
// DO USUNIĘCIA PÓŹNIEJ

const verifyNewPasswordHandler = async (req, res) => {
  try {
    await verifyToken(req.params.passwordVerificationToken);

    const admin = await getAdmin({
      passwordVerificationToken: req.params.passwordVerificationToken,
    });

    if (!admin) {
      return res
        .status(400)
        .send({ message: "Account for verify not found ora link expired" });
    }
    if (admin.verified === false) {
      return res.status(401).send({ message: "Admin account not verified." });
    }

    await updateAdmin(admin.email, {
      password: admin.passwordToBeChanged,
      passwordVerificationToken: null,
      passwordToBeChanged: null,
    });

    return res.status(200).send({ message: "Password changed successfully" });
  } catch (error) {
    console.log("ERROR: ", error);
    if (error.message === "Token expired." || "Token is invalid.") {
      return res.status(401).send({ message: "Link has expired." });
    }
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  registerHandler,
  passwordHandler,
  loginHandler,
  logoutHandler,
  verifyAdminHandler,
  verifyNewPasswordHandler,
};
