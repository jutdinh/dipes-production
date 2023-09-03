const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const ProjectsControllerClass = require('../../controllers/Project/Projects'); 

const ProjectsController = new ProjectsControllerClass()

router.put("/update", async (req, res) => { await ProjectsController.update(req, res, [permission.uad, permission.ad, permission.pm ]) })
router.put("/project/manager", async (req, res) => { await  ProjectsController.changeProjectManager( req, res, [ permission.uad, permission.ad ] ) })
router.put("/project/member/privilege", async (req, res) => { await ProjectsController.changeProjectMemberPrivilege( req, res, [permission.mgr, permission.spv, permission.dpr] )})
module.exports = router;