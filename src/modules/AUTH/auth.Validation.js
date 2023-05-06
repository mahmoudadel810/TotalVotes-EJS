import  joi  from "joi";

export const signUpSchema = {
    body: joi.object().required().keys({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().required().email({ tlds: { allow: ['com', 'net'] } }),
        password: joi.number().required(),
        confirmPassword: joi.number().required().valid(joi.ref('password')),
        gender: joi.string().optional()

    })
};

export const confirmEmailSchema = {

    params: joi.object().required().keys({
        token: joi.string().required()
    })
};




export const loginSchema = {
    body: joi.object().required().keys({

        email: joi.string().required().email({ tlds: { allow: ['com', 'net'] } }),
        password: joi.string().required(),

    })
};