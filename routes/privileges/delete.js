const express = require("express")
const router = express.Router()

const PrivilegesControllerClass = require("../../controllers/Privileges");
const PrivilegesController = new PrivilegesControllerClass()

const PrivilegeDetailControllerClass = require("../../controllers/PrivilegeDetail");
const PrivilegeDetailController = new PrivilegeDetailControllerClass()


const UserPrivilegesControllerClass = require('../../controllers/UserPrivileges')
const UserPrivilegesController = new UserPrivilegesControllerClass()



router.delete('/group', async ( req, res ) => { await PrivilegesController.deletePrivilegeGroup(req, res) })
router.delete('/detail', async ( req, res ) => { await PrivilegeDetailController.removePrivilegeDetail(req, res) })
router.delete('/revoke', async ( req, res ) => { await UserPrivilegesController.revokePrivilege(req, res) })


module.exports = router;