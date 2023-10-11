require("dotenv").config();
const express = require("express"); // เรียกใช้งาน express  mudule
const router = express.Router(); // กำหนด router instance ให้กับ express.Router class
const _ = require("lodash");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

// เราใช้คำสั่ง use() เพื่อเรียกใช้งาน middleware function
// middleware ที่กำงานใน router instance ก่อนเข้าไปทำงานใน route function
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

var conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conn.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + conn.threadId);
});

//insert data
router.post("/insert", (req, res) => {
  let name = _.get(req, ["body", "name"]);
  let email = _.get(req, ["body", "email"]);
  let created = _.get(req, ["body", "created"]);
  //   console.log(name + " " + email + "  " + created);
  try {
    if (name && email) {
      let sql = "INSERT INTO tb_test (name, email, created) VALUES (?,?,?)";
      conn.query(sql, [name, email, created], (err, resp, field) => {
        if (resp) {
          console.log("Inserted " + name);
          return res.status(200).json({
            status: 200,
            message: "Inserted",
          });
        } else {
          console.log("failed: " + err.message);
        }
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: 400,
      message: "Invalid request",
    });
  }
});

//get all data
router.get("/getall", (req, res) => {
  let sql = "SELECT * FROM tb_test";
  conn.query(sql, [], (err, resp, field) => {
    if (resp) {
      console.log("Succss");
      return res.status(200).json({
        status: 200,
        message: "Sucess",
        data: resp,
      });
    } else {
      console.log("failed: " + err.message);
      return res.status(400).json({
        status: 400,
        message: "Bad: " + err.message,
      });
    }
  });
});

//update data some value
router.put("/updateid", (req, res) => {
  let id = _.get(req, ["body", "id"]);
  let name = _.get(req, ["body", "name"]);
  let email = _.get(req, ["body", "email"]);
  let created = _.get(req, ["body", "created"]);
  let sql = "UPDATE tb_test SET name =?, email =?, created =? WHERE id =?";
  if (id && name && email && created) {
    conn.query(
      sql,
      [name, email, created, parseInt(id)],
      (err, data, field) => {
        if (data) {
          console.log(data);
          return res.status(200).json({
            status: 200,
            message: "Sucess",
            data: data,
          });
        } else {
          console.log("failed: " + err.message);
          return res.status(400).json({
            status: 400,
            message: "Bad!: " + err.message,
          });
        }
      }
    );
  } else {
    return res.status(400).json({
      status: 400,
      message: "Not null",
    });
  }
});

//delete data some value
router.delete("/deleteid", (req, res) => {
  let id = _.get(req, ["body", "id"]);
  let sql = "DELETE FROM tb_test WHERE id =?";
  if (id) {
    conn.query(sql, [parseInt(id)], (err, data, field) => {
      if (data) {
        console.log("Succss");
        return res.status(200).json({
          status: 200,
          message: "Sucess",
          data: data,
        });
      } else {
        console.log("failed: " + err.message);
        return res.status(400).json({
          status: 400,
          message: "Bad: " + err.message,
        });
      }
    });
  }
});

module.exports = router; // ส่ง router ที่เราสร้าง ออกไปใช้งานภายนอกไฟล์
