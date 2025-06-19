import User from '../models/User.mongo.js';

// Complete Recruiter Profile
export const completeRecruiterProfile = async(req, res) => {
    try {
        const userId = req.user.id;
        const {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            image,
            location
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                company_name,
                company_description,
                company_website,
                company_size,
                founded_year,
                linkedin,
                image,
                location,
                isProfileComplete: true
            }, { new: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Edit Recruiter Profile
export const editRecruiterProfile = async(req, res) => {
    try {
        const userId = req.user.id;
        const {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            image,
            location
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                company_name,
                company_description,
                company_website,
                company_size,
                founded_year,
                linkedin,
                image,
                location
            }, { new: true }
        );

        res.status(200).json({
            message: 'Profile edited successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Error editing profile' });
    }
};

// // Complete Programmer Profile
// export const completeProgrammerProfile = async(req, res) => {
//     try {
//         const userId = req.user.id;
//         const {
//             aboutMe,
//             location,
//             experience,
//             skills,
//             technology,
//             image
//         } = req.body;
//
//         const updatedUser = await User.findByIdAndUpdate(
//             userId, {
//                 aboutMe,
//                 location,
//                 experience,
//                 skills,
//                 technology,
//                 image,
//                 isProfileComplete: true
//             }, { new: true }
//         );
//
//         res.status(200).json({
//             message: 'Profile updated successfully',
//             user: updatedUser
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating profile' });
//     }
// };