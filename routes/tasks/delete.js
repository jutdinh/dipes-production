const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const TasksControllerClass = require('../../controllers/Project/Tasks'); 

const TasksController = new TasksControllerClass()

router.delete("/task/member", async (req, res) => { await TasksController.taskRemoveMember(req, res, [ permission.mgr, permission.spv ]) })
router.delete("/task", async (req, res) => { await TasksController.removeTask(req, res, [ permission.mgr, permission.spv ]) })

module.exports = router;