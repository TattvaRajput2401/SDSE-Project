const validate = (schema, source = "body") => (req, res, next) => {
  const payload = req[source] || {};
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }

  req[source] = value;
  return next();
};

module.exports = validate;
