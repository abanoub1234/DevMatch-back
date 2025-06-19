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
    founded_year: Joi.string().required().pattern(/^\d{4}$/).custom((value, helpers) => {
        if (parseInt(value) > currentYear) {
            return helpers.message("Year cannot be in the future");
        }
        return value;
    }).messages({
        "string.empty": "Founded year is required",
        "string.pattern.base": "Please enter a valid year (YYYY)"
    }),
    image: Joi.string().uri().allow('').optional()
});

export default recruiterProfileSchema;