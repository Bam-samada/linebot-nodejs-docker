require("dotenv").config();
const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

var connectionStatus = 'Connecting...'; // สถานะการเชื่อมต่อเริ่มต้น

var conn = mysql.createConnection({
  host: "mysql",  // ใช้ชื่อเซอร์วิสจาก Docker Compose
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// พยายามเชื่อมต่อกับฐานข้อมูล
conn.connect(function (err) {
  if (err) {
    // แสดงข้อผิดพลาดหากการเชื่อมต่อไม่สำเร็จ
    console.error('Error connecting to the database: ' + err.stack);
    connectionStatus = 'Error connecting to the database: ' + err.stack; // อัพเดทสถานะการเชื่อมต่อ
    return;
  }
  // แสดงข้อความว่าเชื่อมต่อสำเร็จพร้อม ID ของการเชื่อมต่อ
  console.log('Connected to database as id ' + conn.threadId);
  connectionStatus = 'Connected to database as id ' + conn.threadId; // อัพเดทสถานะการเชื่อมต่อ
});

// เมื่้อเข้ามาที่หน้าแรก path: "/".
router.get("/", function (req, res, next) {
  // แสดงสถานะการเชื่อมต่อบนหน้าเว็บโดยตรง
  res.send(connectionStatus);
});

module.exports = router;
