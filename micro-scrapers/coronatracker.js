const axios = require("axios");
const globals = require("../globals");
const utilities = require("../utilities");

const API_ROUTE = "http://api.coronatracker.com/v2/analytics/country";
const keyMapping = {
  country: "countryName",
  cases: "confirmed",
  deaths: "deaths",
  recovered: "recovered"
};

exports.getSelectedCountries = async (region, countries) => {
  return await axios.get(`${API_ROUTE}`).then(data => {
    const allCountries = data.data;
    const filteredCountries = filterCountries(allCountries, countries);

    utilities.writeJSONFile(
      region,
      generateRegionData(region, filteredCountries)
    );
  });
};

const filterCountries = (allCountries, countries) => {
  const filteredCountries = allCountries.filter(country => {
    return countries.includes(country.countryName);
  });
  return filteredCountries.map(country =>
    utilities.convertAllKeysToString(utilities.remapKeys(country, keyMapping))
  );
};

const generateRegionData = (region, filteredCountries) => {
  let regionTemplate = { ...globals.regionStructure };
  regionTemplate.regionName = region;
  regionTemplate.regions = filteredCountries;
  regionTemplate.regionTotal = utilities.convertAllKeysToString(
    calculateRegionTotal(regionTemplate.regions)
  );

  return regionTemplate;
};

const calculateRegionTotal = regions => {
  let regionTotalTemplate = globals.countryStructure;
  let allDeaths = [];
  let allConfirmed = [];
  let allRecovered = [];

  regions.map(region => {
    allDeaths.push(region.deaths);
    allConfirmed.push(region.cases);
    allRecovered.push(region.recovered);
  });

  regionTotalTemplate.deaths = utilities.addAllNumbers(allDeaths);
  regionTotalTemplate.cases = utilities.addAllNumbers(allConfirmed);
  regionTotalTemplate.recovered = utilities.addAllNumbers(allRecovered);

  return regionTotalTemplate;
};
