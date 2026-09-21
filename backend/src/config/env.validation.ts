import * as Joi from "joi";

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),

  REDIS_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().required(),

  JWT_REFRESH_SECRET: Joi.string().required(),

  FRONTEND_URL: Joi.string().uri().default("http://localhost:3000"),

  BACKEND_URL: Joi.string().uri().default("http://localhost:3001"),

  GOOGLE_CLIENT_ID: Joi.string().allow("").optional(),

  GOOGLE_CLIENT_SECRET: Joi.string().allow("").optional(),

  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),

  GITHUB_CLIENT_ID: Joi.string().allow("").optional(),

  GITHUB_CLIENT_SECRET: Joi.string().allow("").optional(),

  GITHUB_CALLBACK_URL: Joi.string().uri().optional(),

  PORT: Joi.number().default(3001),
});