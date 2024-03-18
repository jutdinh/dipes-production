const express = require("express");
const app = express();
const http = require("http");

const jwt = require("jsonwebtoken");

const { Server } = require("socket.io");
const server = http.createServer(app);

const cors = require("cors");
const bodyparser = require("body-parser");

require("dotenv").config();
const ACCESS_CACHE = "access_cache";

const { Database } = require("./config/models/database");
const Activation = require("./controllers/Activation");

app.use(
  bodyparser.urlencoded({
    limit: "50mb",
    extended: false,
  })
);

app.use(bodyparser.json({ limit: "50mb" }));
app.use(express.static("public"));

app.use(cors());
// {
//   origin: function (origin, callback) {
//     console.log("REQUEST FROM: ", origin);
//     callback(null, true);
//     return;
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   // methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
//   credentials: true,
// }
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const {
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
  SocketController,
} = require("./routes");
const MAX_ACCESS_IN_A_MINUTE = process.env.MAX_ACCESS_IN_A_MINUTE || 2000;

io.on("connection", (socket) => {
  SocketController(io, socket);
  // console.log(io.sockets.adapter.rooms)
});

const ConsumeApi = require("./controllers/ConsumeApi");
const { formatDecNum } = require("./functions/auto_value");

app.use(async (req, res, next) => {
  const accessable = await accessCatch(req);
  if (accessable) {
    next();
  } else {
    res.status(403).send({
      success: false,
      message: `Access denied due to maximum request reach, you can only make ${MAX_ACCESS_IN_A_MINUTE} requests in a minute`,
      data: [],
      fields: [],
    });
  }
});

app.use("/auth", Auth);

app.use(async (req, res, next) => {
  const isProductActivated = await Activation.activationCheck();
  if (isProductActivated) {
    next();
  } else {
    res.status(200).send({
      success: false,
      content: "Product has not been activated yet",
      status: "",
    });
  }
});
// app.use('/projects', Projects )
// app.use('/tasks', Tasks );
app.use("/versions", Versions);
app.use("/logs", Logs);
// app.use('/db/tables', Tables );
// app.use('/db/fields', Fields );
app.use("/apis", Api);
// app.use('/uis', UI );
app.use("/privileges", Privileges);
app.use("/mail", Mailer);

app.post("/api/foreign/data", async (req, res) => {
  req.credential = await verifyToken(req);
  // console.log(65, req.credential)
  const Consumer = new ConsumeApi();
  Consumer.FOREIGNDATA(req, res);
});

const repeatableTask = async () => {
  await Database.deleteMany(ACCESS_CACHE, {});
  console.log(`DELETE ACCESS CACHE`);
};

setInterval(repeatableTask, 1000 * 60);

verifyToken = async (req) => {
  const token = req.header("Authorization");
  if (!token) {
    return false;
  } else {
    const result = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        resolve({ err, decoded });
      });
    });
    if (result.err) {
      return false;
    }
    return jwt.decode(token);
  }
};

const accessCatch = async (req) => {
  const ip = req.ip;
  const url = req.url;

  const accessCount = await Database.select(ACCESS_CACHE, { ip, url });
  if (accessCount) {
    const { count } = accessCount;
    if (count >= MAX_ACCESS_IN_A_MINUTE) {
      return false;
    } else {
      await Database.update(ACCESS_CACHE, { ip, url }, { count: count + 1 });
      return true;
    }
  } else {
    await Database.insert(ACCESS_CACHE, { ip, url, count: 1 });
    return true;
  }
};

app.use(async (req, res, next) => {
  const { url } = req;
  req.credential = await verifyToken(req);
  const requestType = url.split("/")[1];
  const api_id = url.split("/")[2];
  const Consumer = new ConsumeApi();

  if (requestType == "ui") {
    await Consumer.consumeUI(req, res, api_id);
  } else {
    if (requestType == "search") {
      await Consumer.consumeSearch(req, res, api_id);
    } else {
      if (requestType == "export") {
        await Consumer.consumeExport(req, res, api_id);
      } else {
        if (requestType == "import") {
          await Consumer.consumeImport(req, res, api_id);
        } else {
          if (requestType == "d" || requestType == "detail") {
            await Consumer.consumeDetail(req, res, api_id);
          } else {
            if (requestType == "statis") {
              await Consumer.consumeStatis(req, res, api_id);
            } else {
              if (requestType == "csync") {
                await Consumer.consumeCSync(req, res, api_id);
              } else {
                if (requestType == "barcode_activation") {
                  await Consumer.consumeBarcodeActivation(req, res, api_id);
                } else {
                  await Consumer.consume(req, res, api_id);
                }
              }
            }
          }
        }
      }
    }
  }
});

server.listen(process.env.PORT, () => {
  console.log("Server listening on port " + server.address().port);
});

module.exports = app;
