const { verifyToken } = require("./auth.service");
const { getAdmin } = require("../admin/admin.services");

const extractTokenFromHeaders = (headers) => {
  return headers.authorization?.replace("Bearer ", "");
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractTokenFromHeaders(req.headers);

    if (!token) {
      throw new Error("Authorization token is missing.");
    }

    const { email } = verifyToken(token);
    const adminEntity = await getAdmin({ email: email });

    if (!adminEntity || adminEntity.token !== token) {
      throw new Error("Not authorized");
    }

    // req.admin = adminEntity;
    return next();
  } catch (e) {
    return res.status(401).send({ message: e.message });
  }
};

module.exports = {
  authMiddleware,
};
