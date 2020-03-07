const globals = require("./globals");
const fs = require("fs");
const utilities = require("./utilities");

exports.gatherAllRegions = () => {
  return Promise.all(
    globals.allRegions.map(region => fs.promises.readFile(utilities.getJSONPath(region)))
  ).then(values => {
    let data = {};

    values.forEach(value => {
      const regionData = JSON.parse(value);
      data[regionData.regionName] = regionData;
    });
    return {
      ...data,
      allRegions: Object.keys(data)
    };
  });
};
