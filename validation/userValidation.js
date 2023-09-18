const Joi = require('joi');

const userValidationSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    refreshToken: Joi.string()
})



module.exports = userValidationSchema