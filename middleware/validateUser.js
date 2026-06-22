const { createUserFormSchema } = require('../models/createUserValidator');

exports.validate = (req, res, next) => { // Removed async
  try {
    console.log('Request body:', req.body);

    // REMOVED await: safeParse is synchronous
    const validationObj = createUserFormSchema.safeParse(req.body);

    if (!validationObj.success) {
      console.log("Validation Failed:", validationObj.error.issues);
      return res.status(400).json({ errors: validationObj.error.issues });
    }

    // Move to authController.registrar
    next();
  } catch (error) {
    console.error("Middleware crash:", error);
    return res.status(400).json({ errors: "Ocorreu um erro inesperado" });
  }
};
