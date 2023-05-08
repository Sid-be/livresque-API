const jwt = require('jsonwebtoken');
const bcrypt=(require('bcrypt'))


const authMiddle = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    const decod = jwt.verify(token, process.env.JWT_KEY);
    console.log(decod);
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_KEY);
      req.userId = decodedToken.id;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
 module.exports=authMiddle;