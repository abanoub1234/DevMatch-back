import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.mongo.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async(accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email,
                googleId: profile.id,
                role: 'pending', // set to 'pending' so user must choose
                isEmailVerified: true,
                isProfileComplete: false
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));