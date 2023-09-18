const jwt = require('jsonwebtoken');

module.exports.isLoggedIn = function (req, res, next) {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res.status(401).json({ message: 'No token, not authorized' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if(err) {
        if (err.name === 'TokenExpiredError'){
          return res.status(401).json({message: "Token expired"})
        }
        else{
          return res.status(403).json({message:"Token not valid"});
        }
      }
      req.user = decoded;
      return next();
    });
  } catch (err) {
    res.status(401).json({ messsage: 'isLogged In token error' });
  }
};

