const express = require("express")
const router = express.Router()

const PrivilegesControllerClass = require("../../controllers/Privileges");
const PrivilegesController = new PrivilegesControllerClass()

router.get('/tables', (req, res) => { PrivilegesController.getPrivilegesOnTables(req, res) })
router.get('/accounts', (req, res) => { PrivilegesController.getPrivilegesOnUsers(req, res) })
router.get('/group/:id/ui/tree', (req, res) => { PrivilegesController.getUITree(req, res) })
router.get('/groups', (req, res) => { PrivilegesController.getAllPrivilegeGroup(req, res) })

module.exports = router;