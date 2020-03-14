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

    // TODO: This should be abstracted and moved to fetchData.
    data["Europe"].regions.map((europeanRegion, europeanIndex) => {
      data["Global"].regions.map((globalRegion, globalIndex) => {
        if (europeanRegion.country !== globalRegion.country) return;
        const countryName = europeanRegion.country;
        const europeanRegionData = europeanRegion;
        const globalRegionData = globalRegion;

        let syncRegionData = {
          country: countryName,
          cases:
            globalRegionData.cases >= europeanRegionData.cases
              ? globalRegionData.cases
              : europeanRegionData.cases,
          deaths:
            globalRegionData.deaths >= europeanRegionData.deaths
              ? globalRegionData.deaths
              : europeanRegionData.deaths,
          serious:
            globalRegionData.serious >= europeanRegionData.serious
              ? globalRegionData.serious
              : europeanRegionData.serious,
          recovered:
            globalRegionData.recovered >= europeanRegionData.recovered
              ? globalRegionData.recovered
              : europeanRegionData.recovered,
          critical:
            globalRegionData.critical >= europeanRegionData.critical
              ? globalRegionData.critical
              : europeanRegionData.critical
        };

        data["Europe"].regions[europeanIndex] = syncRegionData;
        data["Global"].regions[globalIndex] = syncRegionData;
      });
    });

    data["Europe"].regionTotal = utilities.calculateRegionTotal(
      data["Europe"].regions
    );
    data["Global"].regionTotal = utilities.calculateRegionTotal(
      data["Global"].regions
    );

    return {
      ...data,
      allRegions: Object.keys(data)
    };
  });
};
