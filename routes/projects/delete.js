const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const ProjectsControllerClass = require('../../controllers/Project/Projects'); 

const ProjectsController = new ProjectsControllerClass()

router.delete("/delete", async (req, res) => { await ProjectsController.delete(req, res, [ permission.uad, permission.ad ]) })
router.delete("/remove/project/member", async (req, res) => { await ProjectsController.removeMemberFromProject( req, res, [permission.mgr, permission.spv] ) })

module.exports = router;