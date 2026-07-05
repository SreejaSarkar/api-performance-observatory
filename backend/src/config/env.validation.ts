import * as Joi from "joi";

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),

  REDIS_URL: Joi.string().required(),

  PORT: Joi.number().default(3001),
});