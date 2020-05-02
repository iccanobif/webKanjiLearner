const PORT = 4200

const express = require("express")
const app = express()
const http = require("http").Server(app)

app.use(express.static('dist/webKanjiLearnerFrontend'))
app.use((req, res, next) =>
{
    res.sendFile("index.html", { root: "dist/webKanjiLearnerFrontend" });
})

http.listen(PORT, "0.0.0.0")
console.log("Server running on port " + PORT)

