const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const ProjectsControllerClass = require('../../controllers/Project/Projects'); 

const ProjectsController = new ProjectsControllerClass()

const TasksControllerClass = require('../../controllers/Project/Tasks'); 

const TasksControler = new TasksControllerClass()
router.get('/project/:project_id/tasks/', async (req, res) => { await TasksControler.getAll(req, res) })


router.get('/all/projects', async (req, res) => { ProjectsController.get(req, res, [ permission.uad, permission.ad, permission.pm, permission.pd ]) })
router.get('/project/:project_id', async (req, res) => { ProjectsController.getOneProject(req, res, [ permission.uad, permission.ad, permission.pm, permission.pd ]) })
router.get('/statis', async (req, res) => { await ProjectsController.getStatistic(req, res) })
module.exports = router;