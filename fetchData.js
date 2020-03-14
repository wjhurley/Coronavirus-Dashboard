const globals = require("./globals");
const utilities = require("./utilities");
const bnoScraper = require("./micro-scrapers/bno");
const cnnScraper = require("./micro-scrapers/cnn");
const coronatrackerScraper = require("./micro-scrapers/coronatracker");
const fs = require("fs");

exports.fetchAllData = async () => {
  const allData = {};
  const bnoRegions = globals.allRegions
    .filter(region => {
      return region.scraper === "bno";
    })
    .map(region => bnoScraper.fetchData(region));


  // TODO: Should block app boot.
  Promise.all(bnoRegions)
    .then(data => {

      // Gather BNO data as base.
      data.map(
        resolvedRegion => (allData[resolvedRegion.regionName] = resolvedRegion)
      );
    })
    .then(() => {

      // Sync coronatracker data and BNO data.
      coronatrackerScraper
        .getSelectedCountries("Europe", globals.countryLists["Europe"])
        .then(europeanData => {
          europeanData.regions,
            (allData["Global"].regions = utilities.syncTwoRegions(
              europeanData.regions,
              allData["Global"].regions
            ));

          europeanData.regionTotal = utilities.calculateRegionTotal(
            europeanData.regions
          );
          allData["Global"].regionTotal = utilities.calculateRegionTotal(
            allData["Global"].regions
          );
        })
        .then(() => {

          // Sync USA data and CNN data.
          cnnScraper.fetchData().then(cnnData => {
            cnnData,
              (allData["USA"].regions = utilities.syncTwoRegions(
                cnnData,
                allData["USA"].regions
              ));

            allData["USA"].regionTotal = utilities.calculateRegionTotal(
              allData["USA"].regions
            );

            gatherAllOverrides(allData);

            // Write all JSON files.
            Object.keys(allData).map(finalRegion => {
              utilities.writeJSONFile(finalRegion, allData[finalRegion]);
            });
          });
        });
    });
};

const gatherAllOverrides = (allData) => {
  return Promise.all(
    Object.keys(allData).map(region =>
      fs.promises.readFile(`${utilities.getOverridesJSONPath(region)}`))
  ).then(values => {
    let data = {};

    values.forEach(region => {
      const regionData = JSON.parse(region);
      data[regionData.regionName] = regionData;
    });

    Object.keys(data).map(region => {
      data[region].regions,
        (allData[region].regions = utilities.syncTwoRegions(
          data[region].regions,
          allData[region].regions
        ));

        allData[region].regionTotal = utilities.calculateRegionTotal(
          data[region].regions
        );

        utilities.writeJSONFile(region, allData[region]);
    })
  });
};
