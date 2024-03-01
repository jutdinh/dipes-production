const express = require("express")
const router = express.Router()

const ApiControllerClass = require("../../controllers/Version/Api")

const ApiController = new ApiControllerClass()

router.post('/import/ui', (req, res) => { ApiController.importUI( req, res ) })
router.post('/generate/randomcode', (req, res) => { ApiController.generateRandomData( req, res ) })

module.exports = router;