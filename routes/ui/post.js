const express = require("express")
const router = express.Router()

const UIControllerClass = require("../../controllers/Version/UI")

const UIController = new UIControllerClass()

router.post('/ui', async (req, res) => { await UIController.createUI(req, res) })

module.exports = router;