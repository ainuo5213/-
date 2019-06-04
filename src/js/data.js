const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
app.get('/json', (req, res) => {
    let page = req.query.page;
    let data = readFile();
    page ? res.jsonp(data[page]) : res.jsonp(data)
});

function readFile(options) {
    try {
        let data = fs.readFileSync(path.resolve(__dirname + './../mock/data.json'), options);
        return JSON.parse(data.toString());
    } catch (e) {
        throw e
    }
}

app.listen(8080);
