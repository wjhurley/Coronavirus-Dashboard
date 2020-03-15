const cron = require("node-cron");
const express = require("express");
const fs = require("fs");
const path = require("path");
const stats = require("./fetchData");
const sync = require("./syncData");
const time = require("./getTime");
const globals = require("./globals");
const languages = {
  en: require("./translations/en"),
  zh: require("./translations/zh")
};

// Fetch data every minute.
cron.schedule("* * * * *", () => {
  stats.fetchAllData();
});

const LANG_CODE_REGEX = /^\/([A-Z]{2})([\/\?].*)?$/i;
const SUPPORTED_LANGUAGES = ["en", "zh"];

const getContent = async (req, res, view) => {
  await sync.gatherAllRegions().then(regions => {
    req.lang = !!req.lang ? req.lang : "en";
    res.render(view, {
      data: {
        ...regions,
        language: req.lang,
        path: req.lang === "en" ? "/" : `/${req.lang}`,
        content: languages[req.lang].data,
        lastUpdated: time.getTimeSinceLastUpdated(regions.lastUpdated),
        displayOrder: globals.displayOrder
      }
    });
  });
};

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Match any route with two alpha characters
// before route and set as req.lang.
app.use((req, res, next) => {
  const match = req.url.match(LANG_CODE_REGEX);
  if (match) req.lang = match[1];
  next();
});

app.get("/:lang?/", (req, res) => getContent(req, res, "data"));
app.get("/:lang?/about", (req, res) => res.render("about"));
app.get("/:lang?/data", (req, res) => getContent(req, res, "data"));
app.get("/:lang?/faq", (req, res) => getContent(req, res, "faq"));
app.get("/:lang?/map", (req, res) => getContent(req, res, "map"));
app.get("/:lang?/preparation", (req, res) => getContent(req, res, "prepping"));
app.get("/:lang?/prevention", (req, res) => getContent(req, res, "prevention"));
app.get("/:lang?/tweets", (req, res) => getContent(req, res, "tweets"));
app.get("/:lang?/wiki", (req, res) => getContent(req, res, "coronainfo"));
app.get("/:lang?/travel", (req, res) => getContent(req, res, "travel"));
app.get("/:lang?/press", (req, res) => getContent(req, res, "press"));
app.get("/:lang?/email", (req, res) => getContent(req, res, "email"));

stats.fetchAllData().then(data => {
  app.listen(process.env.PORT || 3000);
  console.log("Listening on port: " + 3000);
});
