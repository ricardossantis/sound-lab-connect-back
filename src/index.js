require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const {log} = require("mercedlogger")
const cors = require("cors")
const UserRouter = require("./controllers/user")
const {createContext} = require("./controllers/middleware")
const rateLimit = require('express-rate-limit')

const {PORT = 3000} = process.env

const app = express()

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

app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`))