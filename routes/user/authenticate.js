const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authorizationHeader = req.headers.authorization;
  // Ensure the header exists
  if (authorizationHeader) {
    // Get token in right structure
    const token = authorizationHeader.split(' ')[1];
    const options = {
      expiresIn: '1d',
    };

    // Ensure the token is valid
    jwt.verify(token, process.env.JWT_SECRET || "test_secret", options, function (err, decoded) {
      if (err) {
        // Handle errors
        console.error("Error Verifying User Token: " + err)
        res.status(500).json({error: "true", message: "Please try again later or contact an administrator if error persists."})
      } else {
        // Ensure token is valid
        if (decoded.exp > Date.now()) {
          res.status(403).json({ error: "true", message: "Authorization header not found"})
        } else {
          // Attach token to req for later use
          req.auth = decoded;
          next();
        }
      }
    });
  } else {
    res.status(403).json({ error: "true", message: "Authorization header not found"})
  }
};