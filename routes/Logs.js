const express = require("express")
const router = express.Router()

const Controller = require('../config/controllers/controller');
const permission = Controller.permission;

const EventLogsObject = require('../controllers/LogController');

const LogController = new EventLogsObject();

router.get('/:lang', async ( req, res ) => { await LogController.get( req, res, [ permission.uad ] ) })
router.post('/search', async ( req, res ) => { await LogController.search( req, res, [ permission.uad ] ) })

router.post('/save/import/devices/json', async ( req, res ) => { await LogController.writeLogImportJSON( req, res ) })

module.exports = router;