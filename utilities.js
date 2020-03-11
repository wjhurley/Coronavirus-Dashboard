exports.getJSONPath = region => {
  return `./tmp/statistics_${region.sheetName}.json`;
};

exports.getCSVPath = region => {
  return `./tmp/data_${region.sheetName}.csv`;
};

exports.getExternalCSV = region => {
  return `https://docs.google.com/spreadsheets/d/1Hz1BO2cGOba0a8WstvMBpjPquSCCWo3u48R7zatx_A0/gviz/tq?tqx=out:csv&sheet=${
    region.sheetName
  }`;
};

exports.subtractTwoValues = (value1, value2) => {
  return (this.parseCommas(value1) - (this.parseCommas(value2) || 0)).toLocaleString()
}

exports.parseCommas = number => {
  return parseInt(number.replace(/,/g, ''), 10);
}
