const express = require("express")
const router = express.Router()

const VersionsControllerClass = require('../../controllers/Project/Versions'); 

const VersionsController = new VersionsControllerClass()


module.exports = router;