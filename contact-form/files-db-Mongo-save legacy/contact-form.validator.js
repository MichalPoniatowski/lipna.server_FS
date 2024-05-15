const Joi = require("joi");

const contactFormSchemaForCreate = Joi.object({
  name: Joi.string().required(),
  surname: Joi.string().optional(),
  email: Joi.string().email().required(),
  description: Joi.string().required(),
  files: Joi.array().optional(),
  answer: Joi.boolean().optional(),
  status: Joi.string()
    .valid("Do wyceny", "Klient zrezygnował", "Brak odpowiedzi od klienta")
    .optional(),
});

const contactFormSchemaForUpdate = Joi.object({
  name: Joi.string().optional(),
  surname: Joi.string().optional(),
  email: Joi.string().email().optional(),
  description: Joi.string().optional(),
  files: Joi.array().optional(),
  answer: Joi.boolean().optional(),
  status: Joi.string()
    .valid("Do wyceny", "Klient zrezygnował", "Brak odpowiedzi od klienta")
    .optional(),
}).min(1);

const contactFormValidateMiddleware = (req, res, next) => {
  // console.log("REQ IN JOI VALIDATOR: ", req.body);
  // console.log("METHOD:", req.method);

  const schema =
    req.method === "PATCH"
      ? contactFormSchemaForUpdate
      : contactFormSchemaForCreate;

  const { error } = schema.validate(req.body);

  if (error) {
    console.log("VALIDATION FAILED", error.details);
    return res.status(400).send({ error: error.message });
  }

  next();
};

module.exports = { contactFormValidateMiddleware };
