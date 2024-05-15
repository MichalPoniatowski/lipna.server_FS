const { Router } = require("express");

const { adminValidatorMiddleware } = require("./admin.validator");
const { authMiddleware } = require("../auth/auth.middleware");

const {
  passwordHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
  verifyAdminHandler,
  verifyNewPasswordHandler,
} = require("./admin.controllers");

const adminRouter = Router();

// REGISTER DO USUNIĘCIA PÓŹNIEJ
adminRouter.post("/register", adminValidatorMiddleware, registerHandler);
// REGISTER DO USUNIĘCIA PÓŹNIEJ

adminRouter.post(
  "/password",
  adminValidatorMiddleware,
  authMiddleware,
  passwordHandler
);
adminRouter.post("/login", adminValidatorMiddleware, loginHandler);
adminRouter.post("/logout", authMiddleware, logoutHandler);
// DO USUNIĘCIA PÓŹNIEJ
adminRouter.get("/verify/:verificationToken", verifyAdminHandler);
// DO USUNIĘCIA PÓŹNIEJ
adminRouter.get(
  "/confirm-new-password/:passwordVerificationToken",
  verifyNewPasswordHandler
);

module.exports = { adminRouter };
