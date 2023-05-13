const jwt = require('jsonwebtoken');
const JWT_KEY='a7c84f57d0c459a57962bc26f6a69f22b4202efad3c4049ce0486eea626e4683c9f9037f77a98367c55309df5d9ec127b4275b33ab3d92e5742af57eecc45eeb'
const authMiddle = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    
   
   
    try {
      const decodedToken = jwt.verify(token,JWT_KEY);
      req.userId = decodedToken.id;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
 module.exports=authMiddle;