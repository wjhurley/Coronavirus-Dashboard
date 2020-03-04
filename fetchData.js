const axios = require("axios");
const cron = require("node-cron");
const csv = require("csvtojson");
const fs = require("fs");

const URL = `https://docs.google.com/spreadsheets/d/14dnT6yUxZiHWvPaEiWsOKu1xPQ_xwkuuUDfMGmFHinc/gviz/tq?tqx=out:csv&sheet=Sheet1`;
const CSV_URL = "/tmp/data.csv";

exports.fetchData = async () => {
  return axios({
    method: "get",
    url: URL,
    responseType: "stream"
  }).then(response => {
    response.data.pipe(fs.createWriteStream(CSV_URL));

    return csv()
      .fromFile(CSV_URL)
      .then(json => generatedData(json));
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
    if (!!data[parentKey].length) {
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

const generatedData = data => {
  const sanitiziedData = removeEmptyRows(data);
  const totalStartKey = "CASES";
  const chinaStartKey = "MAINLAND CHINA";
  const chinaTotalKey = "CHINA TOTAL";
  const otherStartKey = "OTHER PLACES";
  const otherTotalKey = "TOTAL";

  const rowOrder = [
    totalStartKey,
    chinaStartKey,
    chinaTotalKey,
    otherStartKey,
    otherTotalKey
  ];
  const rowIndexes = gatherCategoryIndexes(rowOrder, sanitiziedData);

  const sortedData = {
    totalWorld: gatherBetweenRows(rowIndexes[0], rowIndexes[1], sanitiziedData),

    chinaProvinces: gatherBetweenRows(
      rowIndexes[1],
      rowIndexes[2],
      sanitiziedData
    ),
    totalChina: sanitiziedData.find(element => {
      return element["country "] === chinaTotalKey;
    }),

    otherProvinces: gatherBetweenRows(
      rowIndexes[3],
      rowIndexes[4],
      sanitiziedData
    ),
    otherTotal: sanitiziedData.find(element => {
      return element["country "] === otherTotalKey;
    })
  };

  return trimWhitespaceOnKeys(sortedData);
};

//fetchData();

// Fetch data every 10 minutes.
// cron.schedule('* 10 * * *', () => {
//   fetchData();
// });
