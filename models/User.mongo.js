import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // allow null/undefined for Google users
    role: { type: String, required: true },
    registration_date: { type: Date, default: Date.now },
    location: String,
    company_name: String,
    company_description: String,
    company_website: String,
    company_size: String,
    founded_year: Number, // Added founded_year
    linkedin: String,
    image: String,
    cv_url: String,
    experience: Number,
    skills: String,
    technology: [String],
    isProfileComplete: { type: Boolean, default: false },
    aboutMe: String,
    isPaid: { type: Boolean, default: false }, // Add isPaid flag
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    googleId: { type: String }, // Add googleId field for Google OAuth
    github: String // GitHub profile link
});

export default mongoose.model('User', userSchema);