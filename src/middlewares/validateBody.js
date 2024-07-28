import { validationResult, checkSchema } from 'express-validator';

export const validateBody = (schema) => {
  return [
    checkSchema(schema),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 400,
          message: 'Validation error',
          errors: errors.array(),
        });
      }
      next();
    },
  ];
};
