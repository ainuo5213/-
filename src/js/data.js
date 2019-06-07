const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const iconv = require('iconv-lite');
app.get('/json', (req, res) => {
    let page = req.query.page;
    let data = readFile('data.json', true);
    page ? res.jsonp(data[page]) : res.jsonp(data)
});

app.get('/lyric', (req, res) => {
    let lyricName = req.query.page;
    let data = readFile(lyricName);
    res.jsonp({
        "status": 0,
        "lyric": data
    })
});

function readFile(filename, options) {
    try {
        let data = fs.readFileSync(path.resolve(__dirname + './../mock/' + filename));
        if (options) {
            return JSON.parse(data.toString());
        } else {
            return iconv.decode(data, 'gbk')
        }
    } catch (e) {
        throw e
    }
}

app.listen(8080);
