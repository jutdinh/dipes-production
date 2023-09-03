const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const Projects = require('../../controllers/Project/Projects');
const ProjectsController = new Projects()

const TasksControllerClass = require('../../controllers/Project/Tasks'); 

const TasksController = new TasksControllerClass()

router.post('/project/:project_id/task', async (req, res) => { TasksController.createTask(req, res, [permission.mgr, permission.spv]) })

router.post('/create/', async (req, res ) => { await ProjectsController.createProject(req, res, [ permission.ad ]) })
router.post('/members/', async (req, res) => { await ProjectsController.addMember( req, res, [permission.mgr, permission.spv] ) })
module.exports = router;