var request = require("request");
var cheerio = require("cheerio");
var rp = require("request-promise");

var options = {
  uri: "https://bnonews.com/index.php/2020/01/the-latest-coronavirus-cases/",
  transform: function(body) {
    return cheerio.load(body);
  }
};

var options2 = {
  uri: "https://covid19info.live/",
  transform: function(body) {
    return cheerio.load(body);
  }
};
var holder = [];

function scrapeEvery10Minutes() {
  rp(options)
    .then(function($) {
      var data = {
        chineseData: [],
        chineseSources: [],
        chineseRegionsData: [],
        chineseRegionsSources: [],
        internationalData: []
      };

      const timelineData = $("#mvp-content-main > ul")
        .toArray()
        .map(element => $(element).text());

      day1 = $("#mvp-content-main > ul:nth-child(17) > li > a")
        .toArray()
        .map(element => $(element).attr("href"));

      const timelineDates = $("#mvp-content-main > h4")
        .toArray()
        .map(element => $(element).text());

      timelineDates.pop();

      var timelineDataSplitArray = [];

      for (let index = 0; index < timelineData.length; index++) {
        timelineDataSplitArray.push(timelineData[index].split(" (Source)"));
      }

      for (let index = 0; index < timelineDataSplitArray.length; index++) {
        timelineDataSplitArray[index].pop();
      }

      var timelineArray = [];
      var timelineArrayDates = [];
      var timelineArraySources = [];

      for (let index = 0; index < timelineDataSplitArray.length; index++) {
        timelineArray[index] = timelineDataSplitArray[index].map(str =>
          str.trim().slice(7)
        );

        timelineArrayDates[index] = timelineDataSplitArray[index].map(str =>
          str.trim().slice(0, 5)
        );
      }

      timelineArray.shift();
      timelineArray.shift();

      timelineArrayDates.shift();

      //Chinese data
      const chineseDataStats = $(
        "#mvp-content-main > table.wp-block-table > tbody > tr > td:not(:last-child)"
      )
        .toArray()
        .map(element => $(element).text());

      const quickFacts = $(
        "#mvp-content-main > table.wp-block-table.aligncenter.is-style-stripes > tbody > tr:last-child > td:nth-child(4)"
      )
        .toArray()
        .map(element => $(element).text());

      const quickFactsData = quickFacts[0]
        .split(/[^\d,]/)
        .filter(str => str.trim() !== "");

      const chineseSourcesData = $(
        "#mvp-content-main > table.wp-block-table > tbody > tr > td:nth-child(5) > a"
      )
        .toArray()
        .map(element => $(element).attr("href"));

      console.table(chineseDataStats[100]);

      for (
        i = 0;
        i < chineseDataStats.length * (chineseDataStats.length + 10);
        i++
      ) {
        data.chineseData.push(chineseDataStats.splice(0, 4));

        const victims = data.chineseData[i][3]
          .trim()
          .split(", ")
          .map(num => {
            return num.replace(/\D/g, "");
          });
        data.chineseData[i][3] = victims;
      }

      const mainlandChinaQuery = element => element[0] === "MAINLAND CHINA";
      var mainlandChinaIndex = data.chineseData.findIndex(mainlandChinaQuery);

      const internationalQuery = element => element[0] === "OTHER PLACES";
      var internationalIndex = data.chineseData.findIndex(internationalQuery);

      var mainlandChinaData = data.chineseData.slice(
        Number(mainlandChinaIndex + 1),
        Number(internationalIndex - 1)
      );
      var mainlandChinaSources = chineseSourcesData.slice(
        Number(mainlandChinaIndex),
        Number(internationalIndex - 2)
      );



      var internationalData = data.chineseData.slice(
        Number(internationalIndex + 1),
        data.chineseData.length - 1
      );
      var internationalSources = chineseSourcesData.slice(
        Number(internationalIndex - 4),
        data.chineseData.length
      );

      internationalSources.shift();

      var totalCases = 0;
      var internationalCases = 0;

      for (let index = 0; index < mainlandChinaData.length; index++) {
        totalCases += Number(mainlandChinaData[index][1].replace(/\D/g, ""));
      }

      for (let index = 0; index < internationalData.length; index++) {
        totalCases += Number(internationalData[index][1].replace(/\D/g, ""));
      }

      for (let index = 0; index < internationalData.length; index++) {
        internationalCases += Number(
          internationalData[index][1].replace(/\D/g, "")
        );
      }

      var totalDead = 0;

      for (let index = 0; index < mainlandChinaData.length; index++) {
        totalDead += Number(mainlandChinaData[index][2].replace(/\D/g, ""));
      }

      for (let index = 0; index < internationalData.length; index++) {
        totalDead += Number(internationalData[index][2].replace(/\D/g, ""));
      }

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
      totalDead = numberWithCommas(totalDead);

      totalCases = numberWithCommas(totalCases);

      var totalCountries = internationalData.length + 1;

      holder = [
        data,
        mainlandChinaData,
        "blank",
        internationalData,
        mainlandChinaSources,
        internationalSources,
        "blank",
        totalCases,
        totalDead,
        totalCountries,
        timelineArray,
        timelineDates,
        timelineArrayDates,
        day1,
        quickFactsData,
        internationalCases
      ];
    })
    .catch(function(err) {
      console.log(
        "There has been an error web scraping, default to the database."
      );
    });
  setTimeout(scrapeEvery10Minutes, 1000);
}

scrapeEvery10Minutes();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

app.get("/data", async (req, res) => {
  res.render("data", {
    mainlandData: holder[1],
    mainlandChinaSources: holder[4],
    internationalData: holder[3],
    internationalSources: holder[6],
    quickFactsData: holder[14],
    totalConfirmed: holder[7],
    totalDead: holder[8],
    totalCountries: holder[9],
    internationalCases: holder[15]
  });
});

app.get("/", async (req, res) => {
  res.render("data", {
    mainlandData: holder[1],
    mainlandChinaSources: holder[4],
    internationalData: holder[3],
    internationalSources: holder[6],
    quickFactsData: holder[14],
    totalConfirmed: holder[7],
    totalDead: holder[8],
    totalCountries: holder[9],
    internationalCases: holder[15]
  });
});

app.get("/timeline", async (req, res) => {
  res.render("timeline", {
    timelineDataSplitArray: holder[10],
    timelineDates: holder[11],
    timelineArrayDates: holder[12],
    timelineDataSources: holder[13]
  });
});
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
