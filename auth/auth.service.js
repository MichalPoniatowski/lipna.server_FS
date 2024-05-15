const JWT = require("jsonwebtoken");
const { jwtSecret } = require("../config");

const generateAccessToken = (admin, time) => {
  return JWT.sign(admin, jwtSecret, { expiresIn: time ?? "1h" });
};

const verifyToken = (token) => {
  try {
    return JWT.verify(token, jwtSecret);
  } catch (error) {
    if (error instanceof JWT.TokenExpiredError) {
      // console.log("Token expired.");
      error.message = "Token expired.";
    } else if (error instanceof JWT.JsonWebTokenError) {
      // console.log("Token is invalid.");
      error.message = "Token is invalid.";
    } else {
      // console.log("Unknown token verification error.");
      error.message = "Unknown token verification error.";
    }
    throw new Error(error.message);
  }
};

module.exports = {
  generateAccessToken,
  verifyToken,
};

// const verifyToken = (token, next) => {
//   try {
//     return JWT.verify(token, jwtSecret);
//   } catch (error) {
//     console.error(error);

//     if (error instanceof JWT.TokenExpiredError) {
//       console.log("Token expired.");
//       throw new Error("Token expired.");
//     }

//     if (error instanceof JWT.JsonWebTokenError) {
//       console.log("Token is invalid.");
//       throw new Error("Token is invalid.");
//     }
//     console.log("Unknown token verification error.");
//     throw new Error("Unknown token verification error.");
//   }
// };
