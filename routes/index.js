var express = require('express');
var router = express.Router();

const swaggerUI = require('swagger-ui-express');
const yaml = require('yamljs')
const swaggerDocument = yaml.load('./docs/swagger.yaml');

// Configure Swagger and attempt to edit the host
router.use('/', function(req, res, next){
  swaggerDocument.host = req.get('host');
  if (req.secure) {
    swaggerDocument.servers[0].url = "https://"+req.get('host');
  } else {
    swaggerDocument.servers[0].url = "http://"+req.get('host');
  }
  req.swaggerDoc = swaggerDocument;
  next();
})

// Serve swagger
router.use('/', swaggerUI.serve);

// Send swagger on get requests to /
router.get('/', swaggerUI.setup());

module.exports = router;
