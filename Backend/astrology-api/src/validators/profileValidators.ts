import Joi from "joi";

export const profileCreationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  timeOfBirth: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  city: Joi.string().required(),
  state: Joi.string().allow(""),
  country: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  timezone: Joi.string().default("+5.5"),
});

export const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  gender: Joi.string().valid("male", "female", "other"),
  dateOfBirth: Joi.date().max("now"),
  timeOfBirth: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  city: Joi.string(),
  state: Joi.string().allow(""),
  country: Joi.string(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  timezone: Joi.string(),
}).min(1);
