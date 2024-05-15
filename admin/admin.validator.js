const joi = require("joi");

const adminSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const adminValidatorMiddleware = (req, res, next) => {
  const { error } = adminSchema.validate(req.body);

  if (error) {
    return res.status(400).send({ error: error.message });
  }

  return next();
};

module.exports = {
  adminValidatorMiddleware,
};
