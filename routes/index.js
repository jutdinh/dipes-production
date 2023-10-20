const Auth  = require('./auth');
const Projects = require('./projects')
const Versions = require('./versions')
const Logs = require('./Logs')
const Tasks = require('./tasks')
const Tables = require('./tables')
const Fields = require('./fields')
const Api = require('./api')
const UI = require('./ui')
const Privileges = require('./privileges')
const Mailer = require('./mailer')
const SocketController = require('./socket')

module.exports = {
    Auth,
    Projects,
    Versions,
    Logs,
    Tasks,

    Tables,
    Fields,
    Api,
    UI,
    Privileges,
    Mailer,

    SocketController
}
