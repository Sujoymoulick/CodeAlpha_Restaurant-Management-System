const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseFormatter');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format error message to return all errors in a readable format
    const errorMsg = errors.array().map(err => `${err.path}: ${err.msg}`).join(' | ');
    return sendError(res, errorMsg, 400);
  }
  next();
};

module.exports = {
  validateFields
};
