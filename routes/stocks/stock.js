module.exports = function (req, res) {
  //  Ensure there are no parameters
  if (Object.keys(req.query).length > 0) {
    res.status(400).json({ error: "true", message: "Date parameters only available on authenticated route /stocks/authed"})
  } else {
    // Fetch stocks
    req.db.from('stocks')
        .select('*')
        .where('symbol', '=', req.params.stock)
        .orderBy('timestamp', 'DESC')
        .limit(1)
        .then((rows) => {
          if (rows.length > 0) {
            res.status(200).json(rows[0]);
          } else {
            // Handle no stock
            res.status(404).json({ error: "true", message: "No entry for symbol in stocks database"})
          }
        })
        .catch((err) => {
          // Handle errors
          console.error("Error fetching specific stock: " + err)
          res.status(500).json({error: "true", message: "Please try again later or contact an administrator if error persists."})
        })
  }
}