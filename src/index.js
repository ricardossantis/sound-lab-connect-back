require("dotenv").config()
const express = require("express")
const http = require('http');
const morgan = require("morgan")
const {log} = require("mercedlogger")
const cors = require("cors")
const UserRouter = require("./controllers/user")
const MarketplaceRouter = require("./controllers/marketplace")
const ServiceRouter = require("./controllers/service")
const {createContext} = require("./controllers/middleware")
const rateLimit = require('express-rate-limit')
const { initConnections } = require('./handlers/socketHandler')

const app = express()
const server = http.createServer(app);
const { Server } = require("socket.io");

const socketIO = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods:['GET','POST']
  }
})

initConnections(socketIO)

const {PORT = 3000} = process.env

app.use(cors())
app.use(morgan("tiny"))
app.use(express.json({limit: '2mb'}));
app.use(express.urlencoded({limit: '2mb'}));
app.use(createContext)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Rate limit exceeded'
})

app.use(limiter)

app.get("/", (req, res) => {
    res.send("this is the test route to make sure server is working")
})
app.use("/user", UserRouter)
app.use("/marketplace", MarketplaceRouter)
app.use("/service", ServiceRouter)

server.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));