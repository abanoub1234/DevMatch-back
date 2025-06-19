import Joi from "joi";

export const userSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        "string.empty": "Full name is required",
        "string.min": "Name must be at least 2 characters"
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email address is required",
        "string.email": "Please enter a valid email address"
    }),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters",
            "string.pattern.base": "Password must contain uppercase, lowercase, and number"
        }),
    // confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    //     "any.only": "Passwords do not match",
    //     "any.required": "Please confirm your password"
    // }),
    role: Joi.string().valid("user", "admin", "recruiter", "programmer").required().messages({
        "any.only": "Please select your role"
    }),
    cv_url: Joi.string()
        .uri()
        .when('role', {
            is: 'programmer',
            then: Joi.required().messages({
                "string.empty": "CV URL is required for programmers",
                "string.uri": "CV URL must be a valid URL"
            }),
            otherwise: Joi.forbidden()
        })
        .messages({
            "string.uri": "CV URL must be a valid URL"
        })
});

export default userSchema;