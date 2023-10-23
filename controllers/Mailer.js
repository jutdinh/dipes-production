const nodemailer = require('nodemailer');

const { Controller } = require('../config/controllers');



class Mailer extends Controller {
    #transporter = nodemailer.createTransport(
        {
            service: "gmail",
            auth: {
              user: 'hvcong.email@gmail.com', // Replace with your email address
              pass: 'tnfq oyws fdid ozrx', // Replace with your email password
            },
      }
      
      );

    constructor(){
        super();
    }

    get = async ( req, res ) => {
        this.writeReq(req)

        /* Logical code goes here */

        this.writeRes({ status: 200, message: "Sample response" })
        res.status(200).send({
            success: true,
            content: "Sample response",
            data: []
        })
    }

    sendMail = (req, res) => {
        
        const { subject, text } = req.body.mail;

        const mailOptions = {
            from: 'hvcong.email@gmail.com', // Sender's email address
            to: 'huynhvancongadu@gmail.com', // Recipient's email address
            subject,
            text
            // html: '<p>This is the HTML content of your email.</p>',
        };
        this.#transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
        });
        res.send({ success: true })
    }
}
module.exports = Mailer

    