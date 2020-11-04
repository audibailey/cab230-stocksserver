// Helper function
function checkValid(from, to, datefrom, dateto, length){
    if (length ===  2 && (!isNaN(datefrom) && !isNaN(dateto))) {
      return true;
    } else if (length === 1 && ((!isNaN(datefrom) && to === undefined) || (!isNaN(dateto) && from === undefined))) {
      return true
    } else if (length === 0 && (isNaN(datefrom) && isNaN(dateto)) && (from === undefined && to === undefined)) {
      return true;
    } else {
      return false;
    }
}

// Auth stock function
module.exports = function (req, res) {
  const from = Date.parse(req.query['from'])
  const to = Date.parse(req.query['to'])
  const length = Object.keys(req.query).length

  // Ensure the header exists
  if (!req.auth) {
    res.status(403).json({ error: "true", message: "Authorization header not found"})
  } else {
    // Ensure the parameters are valid
    if (checkValid(req.query['from'], req.query['to'], from, to, length)) {
      // Request stocks from DB
      req.db.from('stocks')
          .select('name', 'symbol', 'industry', 'open', 'high', 'low', 'close', 'volumes', 'timestamp')
          .where(function () { // Where for time range handling
            // If both to and from
            if (!isNaN(from) && !isNaN(to)) {
              this.whereBetween('timestamp', [new Date(req.query['from']), new Date(req.query['to'])])
            } else if (!isNaN(from)) { // If only from
              this.where('timestamp', '>', new Date(req.query['from']))
            } else if (!isNaN(to)) { // If only to
              this.where('timestamp', '<', new Date(req.query['to']))
            } else { // No specific time
              return;
            }
          })
          .where('symbol', '=', req.params.stock)
          .then((rows) => {
            if (rows.length > 0) {
              res.status(200).json(rows);
            } else {
              // Handle if no results
              res.status(404).json({ error: "true", message: "No entries available for query symbol for supplied date range"})
            }
          })
          .catch((err) => {
            // Handle errors
            console.error("Error Fetching AuthStock: " + err)
            res.status(500).json({error: "true", message: "Please try again later or contact an administrator if error persists."})
          })
    } else {
      // Handle incorrect parameters
      res.status(400).json({ error: "true", message: "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"})
    }
  }
}