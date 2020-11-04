// Symbols function
module.exports = function (req, res) {
  const industry = req.query['industry'];

  // Ensure parameters are correct
  if (Object.keys(req.query).length > 0 && !industry) {
    res.status(400).send({ error: "true", message: "Invalid query parameter: only 'industry' is permitted"})
  } else {
    // Fetch name of stocks, the symbol and industry
    req.db.from('stocks')
        .select('name', 'symbol', 'industry')
        .distinct('name', 'symbol')
        .where(function () {
          if (industry) {
            this.where('industry', 'like', '%'+req.query['industry']+'%')
          }
        })
        .then((rows) => {
          if (rows.length > 0) {
            res.status(200).json(rows);
          } else {
            // Handle no results
            res.status(404).json({ error: "true", message: "Industry sector not found"})
          }
        })
        .catch((err) => {
          // Handle errors
          console.error("Error fetching list of symbols: " + err)
          res.status(500).json({error: "true", message: "Please try again later or contact an administrator if error persists."})
        })
  }
}