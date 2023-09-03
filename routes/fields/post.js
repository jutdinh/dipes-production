const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const { uad, ad, pm, pd, mgr, spv, dpr } = Controller.permission;

const TableControllerClass = require('../../controllers/Version/TablesController');
const TableController = new TableControllerClass()

router.post('/fields', async (req, res) => { await TableController.createFields( req, res ) })

module.exports = router;