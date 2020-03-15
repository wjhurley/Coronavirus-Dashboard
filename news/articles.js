const axios = require("axios");

axios.get("http://newsapi.org/v2/everything?q=coronavirus&from=2020-02-14&sortBy=publishedAt&apiKey=cd5b8db618b043909b9aa6e25ebe52d1").then(resp => {

    console.log(resp.data);
});