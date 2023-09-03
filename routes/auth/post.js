const express = require("express")
const router = express.Router()

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const { Auth } = require('../../controllers')
const AuthController = new Auth()

const ActivationClass = require('../../controllers/Activation')
const Activation = new ActivationClass()

router.post('/login', async (req, res) => { await AuthController.login(req, res) })
router.post('/signup', async (req, res) => { await AuthController.signup(req, res, [ permission.uad, permission.ad ]) })
router.post('/activate/key', async( req, res ) => { await Activation.activateKey( req, res ) })
module.exports = router;