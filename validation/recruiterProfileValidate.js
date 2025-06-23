// recruiterProfileValidation.js
import Joi from "joi";

const currentYear = new Date().getFullYear();

const recruiterProfileSchema = Joi.object({
    company_name: Joi.string().trim().required().messages({
        "string.empty": "Company name is required"
    }),
    company_description: Joi.string().trim().required().messages({
        "string.empty": "Description is required"
    }),
    company_website: Joi.string().trim().required().pattern(
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    ).messages({
        "string.empty": "Website is required",
        "string.pattern.base": "Please enter a valid URL"
    }),
    company_size: Joi.string().required().messages({
        "string.empty": "Company size is required"
    }),
    linkedin: Joi.string().allow('').optional().pattern(
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    ).messages({
        "string.pattern.base": "Please enter a valid LinkedIn URL"
    }),
    location: Joi.string().trim().required().messages({
        "string.empty": "Location is required"
    }),
    founded_year: Joi.number()
        .integer()
        .min(1000)
        .max(currentYear)
        .required()
        .messages({
            "number.base": "Founded year must be a number",
            "number.empty": "Founded year is required",
            "number.min": "Please enter a valid year (YYYY)",
            "number.max": "Year cannot be in the future",
            "any.required": "Founded year is required"
        }),
    image: Joi.string().uri().allow('').optional()
});

export const validateRecruiterProfile = (req, res, next) => {
    // Validate only the text fields, not the file
    const { error } = recruiterProfileSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
            message: 'Validation failed',
            errors: errorMessage
        });
    }

    next();
};

export default recruiterProfileSchema;