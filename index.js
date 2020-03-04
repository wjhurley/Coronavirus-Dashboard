var request = require("request");
var cheerio = require("cheerio");
var rp = require("request-promise");
const path = require("path");
const stats = require("./fetchData");
const cron = require("node-cron");
const fs = require("fs");
const JSON_URL = './tmp/statistics.json'
const statistics = require(JSON_URL)

//Fetch data every 10 minutes.
cron.schedule('* * * * *', () => {
  stats.fetchData().then(data => {
    try {
      fs.writeFileSync(JSON_URL, JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  })
});

var express = require("express");
var app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");


app.get("/", async (req, res) => res.render("data", statistics));

app.get("/data", async (req, res) => res.render("data", statistics));


// app.get("/timeline", async (req, res) => {
//   // console.log(holder[13]);
//   // console.log(holder[12]);
//       console.log(holder);
//   res.render("timeline", {
//     timelineDataSplitArray: holder[10] || [],
//     timelineDates: holder[11],
//     timelineArrayDates: holder[12],
//     timelineDataSources: holder[13]
//   });
// });
app.get("/prevention", async (req, res) => {
  res.render("prevention");
});
app.get("/about", async (req, res) => {
  res.render("about");
});
app.get("/map", async (req, res) => {
  res.render("map");
});
app.get("/wiki", async (req, res) => {
  res.render("wiki");
});
app.get("/faq", async (req, res) => {
  res.render("faq");
});
app.get("/tweets", async (req, res) => {
  res.render("tweets");
});
app.get("/preparation", async (req, res) => {
  res.render("prepping");
});
app.listen(process.env.PORT || 3000);
console.log("Listening on port: " + 3000);
