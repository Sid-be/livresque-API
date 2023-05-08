const jwt = require('jsonwebtoken');
const User = require('./models/Book');
const userRole = (roleRequired) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.role === roleRequired) {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = userRole;