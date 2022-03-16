let express = require("express")
let mongoose = require("mongoose")
let bodyParser = require("body-parser")
require("dotenv").config()
let cors = require("cors")
let app = express()

const dns = require("dns")
const urlParser = require("url")

// Basic Configuration
let port = process.env.PORT || 3000

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)

app.use(
  cors({
    origin: "*",
  })
)
app.use(express.json())

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const connection = mongoose.connection

connection.once("open", () => {
  console.log("MongoDB database connection established successfully")
})

app.use("/public", express.static(process.cwd() + "/public"))
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

//Create Schema
const Schema = mongoose.Schema

const urlSchema = new Schema({
  original_url: String,
})
const URL = mongoose.model("URL", urlSchema)

app.post("/api/shorturl", function (req, res) {
  const { url } = req.body

  dns.lookup(urlParser.parse(url).hostname, (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" })
    } else {
      const Url = new URL({ original_url: url })
      Url.save((err, data) => {
        res.json({ original_url: data.original_url, short_url: data.id })
      })
    }
  })
})

app.get("/api/shorturl/:id?", async function (req, res) {
  const { id } = req.params

  try {
    const urlId = await URL.findById(id)
    res.redirect(urlId.original_url)
  } catch (error) {
    res.json({ error: "invalid url" })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port : ${port}`)
})
