const axios = require("axios");
const csv = require("csvtojson");
const fs = require("fs");
const time = require("./getTime");

const URL = `https://docs.google.com/spreadsheets/d/1Hz1BO2cGOba0a8WstvMBpjPquSCCWo3u48R7zatx_A0/gviz/tq?tqx=out:csv&sheet=Sheet1`;
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
      .then(json => {
        return generatedData(json)
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
    if (["totalChina", "totalOther"].includes(parentKey)) {
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

const generatedData = data => {
  const sanitiziedData = removeEmptyRows(data);
  const otherStartKey = "OTHER PLACES";
  const otherTotalKey = "TOTAL";
  const rowOrder = [otherStartKey, otherTotalKey];
  const rowIndexes = gatherCategoryIndexes(rowOrder, sanitiziedData);
  const sortedData = trimWhitespaceOnKeys({
    otherProvinces: gatherBetweenRows(
      rowIndexes[0],
      rowIndexes[1],
      sanitiziedData
    ),
    totalOther: sanitiziedData.find(element => {
      return element["country "] === otherTotalKey;
    }),
  });

  sortedData.totalChina = sortedData.otherProvinces.find(element => {
    return element.country === "Mainland China";
  })
  sortedData.lastUpdated = time.setUpdatedTime();

  return sortedData;
};
