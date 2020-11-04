const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login function
module.exports = function (req, res) {
  const email = req.body.email
  const password = req.body.password

  // Ensure the body has the required information
  if (!email || !password) {
    res.status(400).send({ error: "true", message: "Request body incomplete - email and password needed"})
  } else {
    // Check the DB for the user
    req.db.from('users')
        .select('email', 'hash')
        .where('email', '=', email)
        .then((rows) => {
          if (rows[0] != null) { // If the user exists
            const fetchedEmail = rows[0].email
            const fetchedPassword = rows[0].hash

            // Ensure the password is same as stored password
            bcrypt.compare(password, fetchedPassword, function (err, status) {
              // Handle errors
              if (err) {
                console.error("Failed to compare hash: " + err)
                res.status(500).json({error: "true", message: "Please try again later or contact an administrator if error persists."})
              }
              // Check if password was correct
              if (status) {
                // Send token if correct
                const exp = Math.floor(Date.now()/1000)+86400;
                const secret = process.env.JWT_SECRET || "test_secret";
                const payload = { fetchedEmail, exp };
                const token = jwt.sign(payload, secret);
                res.status(200).json({ token_type: "Bearer", token: token, expires_in: 86400})
              } else {
                res.status(401).json({ error: "true", message: "Incorrect email or password"})
              }
            })
          } else {
            // If no database hits, means email is not valid
            res.status(401).json({ error: "true", message: "Incorrect email or password"})
          }
        })
        .catch((err) => {
          // Handle errors
          console.log("Error fetching list of email from database (login): " + err)
          res.status(500).json({error: "true", message: "Please try again later or contact an administrator if error persists."})
        })
  }
}