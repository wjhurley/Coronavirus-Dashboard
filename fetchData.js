const axios = require("axios");
const csv = require("csvtojson");
const fs = require("fs");
const globals = require("./globals")
const time = require("./getTime");

const getJSONPath = (region) => {
  return `./tmp/statistics_${region.sheetName}.json`
}

const getCSVPath = (region) => {
  return `./tmp/data_${region.sheetName}.csv`;
}

const getExternalCSV = (region) => {
  return `https://docs.google.com/spreadsheets/d/14dnT6yUxZiHWvPaEiWsOKu1xPQ_xwkuuUDfMGmFHinc/gviz/tq?tqx=out:csv&sheet=${region.sheetName}`
}

exports.allData = ()=> {
  let data = {}
  globals.allRegions.forEach(region => {
    data[region.name] = require(getJSONPath(region))
  })
  return {...data, allRegions: Object.keys(data)}
}

exports.fetchAllData = async () => {
  globals.allRegions.forEach(region => fetchData(region))
}

const fetchData = async (region) => {
  return axios({
    method: "get",
    url: getExternalCSV(region),
    responseType: "stream"
  }).then(response => {
    response.data.pipe(fs.createWriteStream(getCSVPath(region)));
    return csv()
      .fromFile(getCSVPath(region))
      .then(json => {
        try {
          const goodData = generatedRegionalData(json, region.startKey, region.totalKey)

          fs.writeFileSync(getJSONPath(region), JSON.stringify(goodData));
          //
          // delete require.cache[require.resolve(getJSONPath(region.name))];
          // statistics = require(getJSONPath(region.name))
        } catch (err) {
          console.error(err);
        }
      });
  });
};

const removeEmptyRows = data => {
  return data.filter(row => !!row["country "]);
};

const gatherCategoryIndexes = (order, data) => {
  return order.map(key =>
    data.findIndex(element => {
      return element["country "] === key;
    })
  );
};

const gatherBetweenRows = (startKey, endKey, data) => {
  return data.slice(startKey + 1, endKey);
};

const trimWhitespaceOnKeys = data => {
  Object.keys(data).map(parentKey => {
    if (["regionTotal"].includes(parentKey)) {
      Object.keys(data[parentKey]).map(key => {
        const oldKey = `${key}`;
        const newKey = key.trim();

        Object.defineProperty(
          data[parentKey],
          newKey,
          Object.getOwnPropertyDescriptor(data[parentKey], oldKey)
        );
        delete data[parentKey][oldKey];
      });
    } else {
      data[parentKey].map(obj => {
        Object.keys(obj).map(key => {
          const oldKey = `${key}`;
          const newKey = key.trim();

          Object.defineProperty(
            obj,
            newKey,
            Object.getOwnPropertyDescriptor(obj, oldKey)
          );
          delete obj[oldKey];
        });
      });
    }
  });

  return data;
};

const generatedRegionalData = (data, startKey, totalKey) => {
  const sanitiziedData = removeEmptyRows(data);
  const rowOrder = [
    startKey,
    totalKey
  ];
  const rowIndexes = gatherCategoryIndexes(rowOrder, sanitiziedData);
  const sortedData = {
    regions: gatherBetweenRows(
      rowIndexes[0],
      rowIndexes[1],
      sanitiziedData
    ),
    regionTotal: sanitiziedData.find(element => {
      return element["country "] === totalKey;
    })
  };
  sortedData.lastUpdated = time.setUpdatedTime();

  return sortedData;
};
