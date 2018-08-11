let express = require('express');
let app = express();
let http = require('http').Server(app);
let fs = require('fs');

function log(msg)
{
    let d = new Date();
    console.log("[" + d.toISOString() + "] " + msg);
}

function printError(e)
{
    log(e.message + " " + e.stack);
};

app.get("/", (req, res) =>
{
    try
    {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile("static/index.htm", (err, data) =>
        {
            if (err) res.end(err);
            else res.end(data);
        });
    }
    catch (e)
    {
        printError(e);
    }
});

app.use(express.static('static', {
    "maxAge": 24 * 60 * 60 * 1000 // 1 day in milliseconds
}));

http.listen(8081, "0.0.0.0");

log("Server running");