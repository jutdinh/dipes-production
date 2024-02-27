const express = require("express")
const router = express.Router()


const PrivilegesControllerClass = require("../../controllers/Privileges");
const PrivilegesController = new PrivilegesControllerClass()

const PrivilegeDetailControllerClass = require("../../controllers/PrivilegeDetail");
const PrivilegeDetailController = new PrivilegeDetailControllerClass()

const UserPrivilegesControllerClass = require('../../controllers/UserPrivileges')
const UserPrivilegesController = new UserPrivilegesControllerClass()

router.post('/create/group', async (req, res) => { await PrivilegesController.createPrivilegeGroup(req, res) })
router.post('/create/detail', async (req, res) => { await PrivilegeDetailController.createPrivilegeDetail(req, res) })
router.post('/grant', async (req, res) => { await UserPrivilegesController.grantUserPrivilege( req, res ) })


module.exports = router;