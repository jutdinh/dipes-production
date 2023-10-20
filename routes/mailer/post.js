const express = require("express")
const router = express.Router()


const Mailer = require('../../controllers/Mailer')
const MailerController = new Mailer()

router.post('/sendmail', (req, res) => { MailerController.sendMail(req, res) })

module.exports = router;