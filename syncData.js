const globals = require("./globals");
const fs = require("fs");
const utilities = require("./utilities");

exports.gatherAllRegions = () => {
  return Promise.all(
    globals.allRegions.map(region =>
      fs.promises.readFile(utilities.getJSONPath(region.sheetName))
    )
  ).then(values => {
    let data = {};

    values.forEach(value => {
      const regionData = JSON.parse(value);

      data[regionData.regionName] = regionData;
      data[regionData.regionName].recoveryRate =
        (parseInt(
          data[regionData.regionName].regionTotal.recovered.replace(",", "")
        ) /
          parseInt(
            data[regionData.regionName].regionTotal.cases.replace(",", "")
          )) *
        100;
    });

    // TODO: This was done in about five minutes with a fever. Refactor.
    // It picks the source with the higher value and defaults to that.
    data["Europe"].regions.map(europeanRegion => {
      data["Global"].regions.map(globalRegion => {
        if (europeanRegion.country === globalRegion.country) {
          const countryName = europeanRegion.country;
          const europeanRegionData = europeanRegion;
          const globalRegionData = globalRegion;

          const globalIsHigher = globalRegion.cases > europeanRegion.cases;

          if (globalRegion.cases == europeanRegion.cases) return;

          if (globalIsHigher) {
            const targetCountryIndex = data["Europe"].regions
              .map((region, index) => {
                return region.country;
              })
              .indexOf(countryName);
            data["Europe"].regions[targetCountryIndex] = globalRegionData;
          } else {
            const targetCountryIndex = data["Global"].regions
              .map((region, index) => {
                return region.country;
              })
              .indexOf(countryName);
            data["Global"].regions[targetCountryIndex] = europeanRegionData;
          }
        }
      });
    });

    return {
      ...data,
      allRegions: Object.keys(data)
    };
  });
};
