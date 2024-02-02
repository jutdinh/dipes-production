const express = require("express")
const router = express.Router()

const VersionsControllerClass = require('../../controllers/Project/Versions'); 

const VersionsController = new VersionsControllerClass()

router.post('/import/database', async ( req, res ) => { VersionsController.importDatabase(req, res) })
router.post('/import/api', async ( req, res ) => { VersionsController.importAPI(req, res) })
router.post('/version', async ( req, res ) => { VersionsController.newVersion(req, res) })
module.exports = router;