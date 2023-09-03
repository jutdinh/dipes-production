const express = require("express")
const router = express.Router()

const VersionsControllerClass = require('../../controllers/Project/Versions'); 

const VersionsController = new VersionsControllerClass()

router.get('/p/:project_id', async (req, res) => { await VersionsController.getVersions(req, res) })
router.get('/v/:version_id', async (req, res) => { await VersionsController.getOneVersion(req, res) })

module.exports = router;