const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const TasksControllerClass = require('../../controllers/Project/Tasks'); 

const TasksController = new TasksControllerClass()

router.post('/task/members', async (req, res) => { await TasksController.taskAddMembers( req, res, [ permission.mgr, permission.spv ] ) })

module.exports = router;