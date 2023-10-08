const express = require('express');
const app = express();
const http = require('http');

const jwt = require('jsonwebtoken');

const { Server } = require('socket.io');
const server = http.createServer(app);

const cors = require("cors");
const bodyparser = require('body-parser');

require('dotenv').config();

const Activation = require('./controllers/Activation')

app.use(bodyparser.urlencoded({
    limit: "50mb",
    extended: false,
}));

app.use(bodyparser.json({ limit: "50mb" }));
app.use( express.static('public') );
app.use( cors() )

const io = new Server(server, {
  cors: {
    origin: "*"
  },
});


const { Auth, Projects, Versions, Logs, Tasks, Tables, Fields, Api, UI, Privileges, SocketController } = require('./routes');

io.on("connection", (socket) => {  
    SocketController(io, socket)
    // console.log(io.sockets.adapter.rooms)
})

const ConsumeApi = require('./controllers/ConsumeApi');

app.use('/auth', Auth )

app.use(async (req, res, next) => {
  const isProductActivated = await Activation.activationCheck()
  if( isProductActivated ){
    next()
  }else{
    res.status(200).send({ success:false, content: "Product has not been activated yet", status: "" })
  }
})
// app.use('/projects', Projects )
// app.use('/tasks', Tasks );
app.use('/versions', Versions );
// app.use('/logs', Logs );
// app.use('/db/tables', Tables );
// app.use('/db/fields', Fields );
app.use('/apis', Api );
// app.use('/uis', UI );
app.use('/privileges', Privileges)

app.post('/api/foreign/data', async (req, res) => {
    req.credential = await verifyToken(req)
    // console.log(65, req.credential)
    const Consumer = new ConsumeApi();  
    Consumer.FOREIGNDATA( req, res )
})



verifyToken = async (req) => {
  const token = req.header('Authorization');
  if( !token ){
      return false;
  }else{
      const result = await new Promise( (resolve, reject) => {
          jwt.verify(token, process.env.TOKEN_KEY, ( err, decoded ) => {
              resolve({ err, decoded })
          })
      })      
      if( result.err ){
          return false;
      }
      return jwt.decode(token);
  }
}

app.use( async (req, res, next) => {
  const { url } = req;
  req.credential = await verifyToken(req)
  const requestType = url.split('/')[1]
  const api_id = url.split('/')[2]
  const Consumer = new ConsumeApi();  
  if( requestType == "ui" ){
    Consumer.consumeUI( req, res, api_id )
  }else{
    if( requestType == "search" ){
      Consumer.consumeSearch( req, res, api_id )
    }else{
      if( requestType == "export" ){
        Consumer.consumeExport( req, res, api_id )
      }else{
        if( requestType == "import" ){
          Consumer.consumeImport( req, res, api_id )
        }else{
          if(requestType == "d"){
            Consumer.consumeDetail( req, res, api_id )
          }else{
            Consumer.consume( req, res, api_id )
          }
        }
      }
    }
  }
  
})

server.listen(process.env.PORT,  () => {
  console.log('Server listening on port ' + server.address().port);
});

module.exports = app;
