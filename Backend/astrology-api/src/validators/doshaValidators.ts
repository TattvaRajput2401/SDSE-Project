import Joi from "joi";

export const doshaCheckSchema = Joi.object({
  doshaType: Joi.string()
    .valid("manglik", "kalsarp", "sadesati", "pitradosh", "nadi")
    .required(),
  profileId: Joi.string().hex().length(24),
});
