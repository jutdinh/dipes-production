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
app.use(express.static('public'));
app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "*"
  },
});


const { Auth, Projects, Versions, Logs, Tasks, Tables, Fields, Api, UI, Privileges, Mailer, SocketController } = require('./routes');

io.on("connection", (socket) => {
  SocketController(io, socket)
  // console.log(io.sockets.adapter.rooms)
})

const ConsumeApi = require('./controllers/ConsumeApi');
const { formatDecNum } = require('./functions/auto_value');

app.use('/auth', Auth)

app.use(async (req, res, next) => {
  const isProductActivated = await Activation.activationCheck()
  if (isProductActivated) {
    next()
  } else {
    res.status(200).send({ success: false, content: "Product has not been activated yet", status: "" })
  }
})
// app.use('/projects', Projects )
// app.use('/tasks', Tasks );
app.use('/versions', Versions);
app.use('/logs', Logs);
// app.use('/db/tables', Tables );
// app.use('/db/fields', Fields );
app.use('/apis', Api);
// app.use('/uis', UI );
app.use('/privileges', Privileges)
app.use('/mail', Mailer)

app.post('/api/foreign/data', async (req, res) => {
  req.credential = await verifyToken(req)
  // console.log(65, req.credential)
  const Consumer = new ConsumeApi();
  Consumer.FOREIGNDATA(req, res)
})


function repeatableTask() {
  console.log('Task is running. Time:', new Date().toISOString());
}

const intervalId = setInterval(repeatableTask, 1000); // Runs every 5 seconds



app.get('/api/test/statistic', async (req, res) => {

  const response = await fetch(`http://192.168.15.29:8085/activeonline/apistatistical2?customer=Mylan Digital Solution`)
  const serialized = await response.json()

  const { data } = serialized;

  const { followModel } = data;

  const years = Object.keys(followModel)

  const statistic = {}

  const formateDeviceName = (name) => {
    if (name == 'printhead') {
      name = "print head"
    }
    const firstChar = name[0].toUpperCase()
    return firstChar + name.slice(1, name.length)
  }


  const sortStatis = (statis) => {
    let keys = Object.keys(statis);
    keys.sort((a, b) => {
      const splittedA = a.split(' ')
      const splittedB = b.split(' ')

      const yearAPart = parseInt(splittedA[1])
      const monthAPart = parseInt(splittedA[0])

      const yearBPart = parseInt(splittedB[1])
      const monthBPart = parseInt(splittedB[0])

      return (yearAPart * 12 + monthAPart) > (yearBPart * 12 + monthBPart) ? 1 : -1
    })

    if (keys.length > 0) {

      const startTime = keys[0]
      const endTime = keys[keys.length - 1]

      const minYear = parseInt(startTime.split(' ')[1])
      const maxYear = parseInt(endTime.split(' ')[1])

      for (let i = minYear; i <= maxYear; i++) {
        for (let j = 1; j <= 12; j++) {
          const controller = statis[`${(j)} ${i} Controller`]
          const printhead = statis[`${(j)} ${i} Print head`]
          const printer = statis[`${(j)} ${i} Printer`]

          if (controller == undefined) {
            statis[`${(j)} ${i} Controller`] = 0
          }
          if (printhead == undefined) {
            statis[`${(j)} ${i} Print head`] = 0
          }
          if (printer == undefined) {
            statis[`${(j)} ${i} Printer`] = 0
          }
        }
      }

      keys = Object.keys(statis);
      keys.sort((a, b) => {
        const splittedA = a.split(' ')
        const splittedB = b.split(' ')

        const yearAPart = parseInt(splittedA[1])
        const monthAPart = parseInt(splittedA[0])

        const yearBPart = parseInt(splittedB[1])
        const monthBPart = parseInt(splittedB[0])

        return (yearAPart * 12 + monthAPart) > (yearBPart * 12 + monthBPart) ? 1 : -1
      })

      const Keysvalue = {
        "Printer": 0,
        "Print": 1, // it mean print head
        "Controller": 2
      }

      for (let i = 0; i < keys.length; i += 3) {
        const a = keys[i]
        const b = keys[i + 1]
        const c = keys[i + 2]

        const arr = [a, b, c]
        arr.sort((x, y) => Keysvalue[x.split(' ')[2]] > Keysvalue[y.split(' ')[2]] ? -1 : 1)


        keys[i] = arr[0]
        keys[i + 1] = arr[1]
        keys[i + 2] = arr[2]

      }
    }

    const sortedStatis = {}
    for (let i = 0; i < keys.length; i++) {
      sortedStatis[keys[i]] = statis[keys[i]]
    }

    return sortedStatis
  }



  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    const yearData = followModel[year]

    const devices = Object.keys(yearData)

    for (let j = 0; j < devices.length; j++) {
      const device = devices[j]
      const deviceData = yearData[device]

      const deviceSeries = Object.keys(deviceData)
      for (let k = 0; k < deviceSeries.length; k++) {
        const series = deviceSeries[k]
        const seriesData = deviceData[series]

        for (let h = 1; h <= 12; h++) {

          if (statistic[`${h} ${year} ${formateDeviceName(device)}`] == undefined) {
            statistic[`${h} ${year} ${formateDeviceName(device)}`] = {}
          }
          statistic[`${h} ${year} ${formateDeviceName(device)}`][series] = seriesData[h - 1]
        }
      }
    }
  }

  const sortedStatis = sortStatis(statistic) 

  const statis = {
    display_name: "Thống kê giả trân",
    type: "table",
    headers:  Object.keys(sortedStatis),
    values: Object.values(sortedStatis),
  }
  
  res.status(200).send({ success: true, statistic: [statis]})
})


verifyToken = async (req) => {
  const token = req.header('Authorization');
  if (!token) {
    return false;
  } else {
    const result = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        resolve({ err, decoded })
      })
    })
    if (result.err) {
      return false;
    }
    return jwt.decode(token);
  }
}

app.use(async (req, res, next) => {
  const { url } = req;
  req.credential = await verifyToken(req)
  const requestType = url.split('/')[1]
  const api_id = url.split('/')[2]
  const Consumer = new ConsumeApi();
  if (requestType == "ui") {
    Consumer.consumeUI(req, res, api_id)
  } else {
    if (requestType == "search") {
      Consumer.consumeSearch(req, res, api_id)
    } else {
      if (requestType == "export") {
        Consumer.consumeExport(req, res, api_id)
      } else {
        if (requestType == "import") {
          Consumer.consumeImport(req, res, api_id)
        } else {
          if (requestType == "d") {
            Consumer.consumeDetail(req, res, api_id)
          } else {
            Consumer.consume(req, res, api_id)
          }
        }
      }
    }
  }

})

server.listen(process.env.PORT, () => {
  console.log('Server listening on port ' + server.address().port);
});

module.exports = app;
