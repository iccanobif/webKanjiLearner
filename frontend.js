const PORT =
  process.env.PORT == undefined ? 4200 : Number.parseInt(process.env.PORT);

const express = require("express");
const app = express();
const http = require("http").Server(app);

app.use(express.static("dist/webKanjiLearnerFrontend"));
app.use((req, res, next) => {
  res.sendFile("index.html", { root: "dist/webKanjiLearnerFrontend" });
});

http.listen(PORT, "0.0.0.0");
console.log("Server running on port " + PORT);
