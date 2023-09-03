const express = require("express")
const router = express.Router()

const ApiControllerClass = require("../../controllers/Version/Api")

const ApiController = new ApiControllerClass()


module.exports = router;