const express = require("express")
const router = express.Router()

const PrivilegesControllerClass = require("../../controllers/Privileges");
const PrivilegesController = new PrivilegesControllerClass()

router.put('/account/:username/:table_id', (req, res) => { PrivilegesController.changeUserPrivileges(req, res) })

module.exports = router;