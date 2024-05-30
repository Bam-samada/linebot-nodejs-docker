require("dotenv").config();
const express = require("express"); // เรียกใช้งาน express  mudule
const router = express.Router(); // กำหนด router instance ให้กับ express.Router class
const mysql = require("mysql2");
const _ = require("lodash");

router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

var conn = mysql.createConnection({
  host: "mysql",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conn.connect(function (err) {
  if (err) {
    console.error("test error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + conn.threadId);
});

// เมื่้อเข้ามาที่หน้าแรก path: "/".
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
