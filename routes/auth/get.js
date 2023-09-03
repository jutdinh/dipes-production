const express = require("express")
const router = express.Router()

const { Auth } = require('../../controllers')

const Controller = require('../../config/controllers/controller');
const permission = Controller.permission;

const AuthController = new Auth()

const ActivationClass = require('../../controllers/Activation')
const Activation = new ActivationClass()

router.get('/u/:username', async (req, res) => { await AuthController.getUserInfor(req, res, [ permission.uad, permission.ad, permission.pm,permission.pd ]) })
router.get('/all/accounts', async (req, res) => { await AuthController.getAllUserInfor( req, res, [ permission.uad, permission.ad, permission.pm, permission.pd ] ) })
router.get('/activation/machine_id', async (req, res) => { await Activation.generateActivationKey( req, res ) })
router.get('/activation/check', async (req, res) => { await Activation.checkActivationKey( req, res ) })

router.get('/token/check', async (req, res) => { await AuthController.tokenCheck( req, res ) })
module.exports = router;