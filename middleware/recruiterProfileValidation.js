import recruiterProfileSchema from "../validation/recruiterProfileValidate.js";

export const validateRecruiterProfile = (req, res, next) => {
    const validation = recruiterProfileSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        return res.status(400).json({
            errors: validation.error.details.map((err) => err.message)
        });
    }
    next();
};