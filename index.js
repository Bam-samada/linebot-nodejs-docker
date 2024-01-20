require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT;
const webhook = require("./routes/webhook"); // ใช้งาน router module
const book = require("./routes/book"); // ใช้งาน router module
const indexWeb = require("./routes/index"); // ส่วนของการใช้งาน router module ต่างๆ
const path = require("path"); // เรียกใช้งาน path module

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("view options", { delimiter: "?" });

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules")));

app.get("/", (req, res) => {
  res.send("Hollo");
});
// เรียกใช้งาน indexWeb
app.use("/index", indexWeb);
// เรียกใช้งานในรูปแบบ middlewar โดยใช้ use
app.use("/book", book);
// เรียกใช้งานในรูปแบบ middlewar โดยใช้ use
app.use("/webhook", webhook);

app.listen(PORT, () => {
  console.log(`listening at ${PORT}`);
});


