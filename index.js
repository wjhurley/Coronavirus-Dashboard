const cron = require("node-cron");
const express = require("express");
const fs = require("fs");
const path = require("path");
const stats = require("./fetchData");

const JSON_URL = './tmp/statistics.json'
let statistics = require(JSON_URL)

//Fetch data every 10 minutes.
cron.schedule('* * * * *', () => {
  stats.fetchData().then(data => {
    try {
      fs.writeFileSync(JSON_URL, JSON.stringify(data));
      delete require.cache[require.resolve(JSON_URL)];
      statistics = require(JSON_URL)
    } catch (err) {
      console.error(err);
    }
  })
});


const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("data", statistics));
app.get("/about", (req, res) => res.render("about"));
app.get("/data", (req, res) => res.render("data", statistics));
app.get("/faq", (req, res) => res.render("faq"));
app.get("/map", (req, res) => res.render("map"));
app.get("/preparation", (req, res) => res.render("prepping"));
app.get("/prevention", (req, res) => res.render("prevention"));
app.get("/tweets", (req, res) => res.render("tweets"));
app.get("/wiki", (req, res) => res.render("wiki"));
app.get("/travel", (req, res) => res.render("travel"));

app.listen(process.env.PORT || 3000);
console.log("Listening on port: " + 3000);
