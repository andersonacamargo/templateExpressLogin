 import {createUserFormSchema } from '../models/createUserValidator.js';
 
 export const validateCreateProduct = (
  req, res, next
) => {
  console.log('erq',req.body);

  const validationObj = createUserFormSchema.safeParse(req.body);

  if (!validationObj.success) {
    return res.status(400).send({ errors: validationObj.error.issues });
  }

  next();
};
