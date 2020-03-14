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

    data["Europe"].regions,
    data["Global"].regions = utilities.syncTwoRegions(
        data["Europe"].regions,
        data["Global"].regions
    );

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
