const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const VersionsControllerClass = require('../../controllers/Project/Versions'); 

const VersionsController = new VersionsControllerClass()

router.put("/version/info", async (req, res) => { await VersionsController.updateVersion( req, res, [ permission.mgr, permission.spv ] ) })

module.exports = router;