const fs = require("fs");
const globals = require("./globals");

exports.getJSONPath = region => {
  return `./tmp/statistics_${region}.json`;
};

exports.getCSVPath = region => {
  return `./tmp/data_${region}.csv`;
};

exports.getExternalCSV = region => {
  return `https://docs.google.com/spreadsheets/d/1Hz1BO2cGOba0a8WstvMBpjPquSCCWo3u48R7zatx_A0/gviz/tq?tqx=out:csv&sheet=${
    region.sheetName
  }`;
};

exports.addAllNumbers = numbers => {
  if(numbers.length === 0) return 0;

  numbers = numbers.map(number => {
    return this.parseCommas(number);
  });
  return numbers.reduce((a, b) => a + b).toLocaleString();
};

exports.subtractTwoValues = (value1, value2) => {
  return (
    this.parseCommas(value1) - (this.parseCommas(value2) || 0)
  ).toLocaleString();
};

exports.parseCommas = number => {
  number = ["", " ", "-"].includes(number) ? "0" : number;
  return parseInt(number.replace(/,/g, ""), 10);
};

exports.writeJSONFile = (region, data) => {
  if(!data.regions.legnth) return
  try {
    fs.writeFileSync(this.getJSONPath(region), JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

exports.remapKeys = (country, keyMapping) => {
  let remappedCountry = { ...globals.countryStructure };

  Object.keys(keyMapping).map(key => {
    remappedCountry[key] = country[keyMapping[key]];
  });

  return remappedCountry;
};

exports.convertAllKeysToString = object => {
  Object.keys(object).map(key => {
    object[key] = isNaN(object[key])
      ? object[key]
      : object[key].toLocaleString();
  });
  return object;
};

exports.calculateRegionTotal = regions => {
  let regionTotalTemplate = {...globals.countryStructure}
  let allConfirmed = [];
  let allDeaths = [];
  let allRecovered = [];
  let allSerious = [];
  let allCritical = [];

  regions.map(region => {
    allConfirmed.push(region.cases);
    allDeaths.push(region.deaths);
    allRecovered.push(region.recovered);
    allSerious.push(region.serious);
    allCritical.push(region.critical);
  });

  regionTotalTemplate.cases = this.addAllNumbers(allConfirmed);
  regionTotalTemplate.deaths = this.addAllNumbers(allDeaths);
  regionTotalTemplate.recovered = this.addAllNumbers(allRecovered);
  regionTotalTemplate.serious = this.addAllNumbers(allSerious);
  regionTotalTemplate.critical = this.addAllNumbers(allCritical);

  return regionTotalTemplate;
};
