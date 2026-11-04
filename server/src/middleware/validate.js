const { validationResult } = require('express-validator');

/**
 * validate — Express middleware that checks the results of any preceding
 * express-validator chains.
 *
 * Place this middleware AFTER your validator arrays and BEFORE the
 * controller handler in a route definition.
 *
 * Returns 400 with a structured error list when validation fails;
 * otherwise calls next() to continue the request pipeline.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = { validate };
