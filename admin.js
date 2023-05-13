const jwt = require('jsonwebtoken');
const {sequelize,User} = require('./models/Book');
const JWT_KEY='a7c84f57d0c459a57962bc26f6a69f22b4202efad3c4049ce0486eea626e4683c9f9037f77a98367c55309df5d9ec127b4275b33ab3d92e5742af57eecc45eeb'
const userRole = (roleRequired) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_KEY);
    const userId = decodedToken.id;
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