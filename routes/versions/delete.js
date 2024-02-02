const express = require("express")
const router = express.Router()

const VersionsControllerClass = require('../../controllers/Project/Versions'); 

const VersionsController = new VersionsControllerClass()

router.delete("/version", async (req, res) => { await VersionsController.removeVersion( req, res ) })

module.exports = router;