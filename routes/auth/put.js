const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const { Auth } = require('../../controllers')

const AuthController = new Auth()

router.put('/user', async (req, res) => { await AuthController.updateUser( req, res, [ permission.uad, permission.ad ]) })
router.put('/avatar', async (req, res) => { await AuthController.changeAva( req, res, [ permission.uad, permission.ad]) })

router.put('/self/info', async (req, res) => { await AuthController.selfUpdate( req, res ) })
router.put('/self/avatar', async (req, res) => { await AuthController.selfChangeAva( req, res ) })


module.exports = { PUT: router };