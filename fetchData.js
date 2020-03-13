const globals = require("./globals");
const bnoScraper = require("./micro-scrapers/bno");
const coronatrackerScraper = require("./micro-scrapers/coronatracker");

exports.fetchAllData = async () => {
  await bnoScraper.fetchAllData().then(data => {
    return coronatrackerScraper.getSelectedCountries(
      "Europe",
      globals.countryLists["Europe"]
    );
  });
};
