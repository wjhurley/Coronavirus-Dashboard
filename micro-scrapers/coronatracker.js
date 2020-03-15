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

exports.getSelectedCountries = (region, countries) => {
  return axios.get(`${API_ROUTE}`).then(data => {
    const allCountries = data.data;
    const filteredCountries = filterCountries(allCountries, countries);

    return generateRegionalData(region, filteredCountries)
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

const generateRegionalData = (region, filteredCountries) => {
  let regionTemplate = { ...globals.regionStructure };
  regionTemplate.regionName = region;
  regionTemplate.regions = filteredCountries;
  regionTemplate.regionTotal = utilities.convertAllKeysToString(
    utilities.calculateRegionTotal(regionTemplate.regions)
  );

  return regionTemplate;
};
