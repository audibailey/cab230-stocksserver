const bcrypt = require('bcrypt');

module.exports = function (req, res) {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    res.status(400).send({ error: "true", message: "Request body incomplete - email and password needed"})
  } else {
    req.db.from("users")
        .select("*")
        .where("email", '=', email)
        .then((rows) => {
          if (rows.length > 0) {
            res.status("409").send({ error: "true", message: "User already exists!"})
          } else {
            const salt = 10;
            bcrypt.hash(password, salt, function (err, hash) {
              if (err) {
                console.error("Error Hashing User: " + err)
                return;
              } else {
                req.db("users").insert({email: email, hash: hash}).then( (rows) => {
                    if (rows[0] > 0) {
                      res.status("201").send({success: "true", message: "User created"})
                    } else {
                      console.log("User Not Inserted")
                      return;
                    }
                  }
                ).catch((err) => {
                  console.error("Error Inserting New User: " + err)
                  return;
                })
              }
            })
          }
        })
        .catch((err) => {
          console.error("Error fetching list of email from database (register): " + err)
        })
  }
}