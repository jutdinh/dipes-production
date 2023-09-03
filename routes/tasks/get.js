const express = require("express")
const router = express.Router()

const TasksControllerClass = require('../../controllers/Project/Tasks'); 

const TasksControler = new TasksControllerClass()


module.exports = router;