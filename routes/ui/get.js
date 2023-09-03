const express = require("express")
const router = express.Router()

const UIControllerClass = require("../../controllers/Version/UI")

const UIController = new UIControllerClass()

router.get('/v/:version_id', async (req, res) => { await UIController.getUIs(req, res) })
router.get('/u/:version_id/:ui_id', async (req, res) => { await UIController.getUI(req, res) })

module.exports = router;
