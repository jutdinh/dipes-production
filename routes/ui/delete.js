const express = require("express")
const router = express.Router()

const UIControllerClass = require("../../controllers/Version/UI")

const UIController = new UIControllerClass()

router.delete('/ui', async (req, res) => { await UIController.removeUI(req, res) })

module.exports = router;