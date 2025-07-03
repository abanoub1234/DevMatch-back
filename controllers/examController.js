import User from '../models/User.mongo.js';

export const submitExam = async (req, res) => {
    try {
        const userId = req.user.id;
        let { score } = req.body;
        score = Number(score);
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.blocked) return res.status(403).json({ message: 'Account blocked due to exam failures.' });

        // Ensure examAttempts is always a number
        user.examAttempts = Number(user.examAttempts) || 0;

        if (score >= 0.7) {
            user.examPassed = true;
            user.examAttempts = 0;
        } else {
            user.examAttempts += 1;
            if (user.examAttempts >= 3) {
                user.blocked = true;
            }
        }
        await user.save();
        res.json({
            examPassed: user.examPassed,
            blocked: user.blocked,
            examAttempts: user.examAttempts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};