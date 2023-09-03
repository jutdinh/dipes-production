const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const TasksControllerClass = require('../../controllers/Project/Tasks'); 

const TasksController = new TasksControllerClass()

router.put('/task/status', async (req, res) => { await TasksController.updateState( req, res ) })
router.put('/task/info', async (req, res) => { await TasksController.updateInfo( req, res, [ permission.mgr, permission.spv ] ) })
router.put('/task/approve', async (req, res) => { await TasksController.updateApproval( req, res, [ permission.mgr, permission.spv ] ) })


module.exports = router;