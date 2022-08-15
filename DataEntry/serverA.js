const express = require("express");
const app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server, {
  allowEIO3: true, // false by default
});
const controllerRouter = require("./routes/controller");
var API = require("./models/API");

const bodyParser = require("body-parser");
const path = require("path");

//----------------- Middleware -----------------
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.static("./views/static"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

//---------------- Back side ------------------
API.Run();

//---------------- Front side ------------------
app.use("/", controllerRouter);

const Port = process.env.PORT | 3000;
//http://localhost:3000
server.listen(Port, () => console.log(`App listening at http://localhost:${Port}`));
