const User = require('../models/user');

module.exports = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
            const error = new Error('Un-authorized');
            error.statusCode = 403;
            throw error;
        }
    } catch (error) {
        next(error);
    }
    next();
}