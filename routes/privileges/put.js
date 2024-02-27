const express = require("express")
const router = express.Router()

const PrivilegesControllerClass = require("../../controllers/Privileges");
const PrivilegesController = new PrivilegesControllerClass()


const UserPrivilegesControllerClass = require('../../controllers/UserPrivileges')
const UserPrivilegesController = new UserPrivilegesControllerClass()





router.put('/account/:username/:table_id', (req, res) => { PrivilegesController.changeUserPrivileges(req, res) })
router.put('/group', (req, res) => { PrivilegesController.updatePrivilegeGroup(req, res) })
router.put('/modify', (req, res) => { UserPrivilegesController.modifyPrivilege(req, res) })


module.exports = router;