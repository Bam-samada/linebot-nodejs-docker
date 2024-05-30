require("dotenv").config();
const express = require("express"); // เรียกใช้งาน express  mudule
const router = express.Router(); // กำหนด router instance ให้กับ express.Router class
const mysql = require("mysql2");
const multer = require("multer");
const _ = require("lodash");

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, process.env.DIR_IMAGES);
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage, limits: { fileSize: 2000000 } });

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

// เมื่้อเข้ามาที่หน้าแรก path: "/".
router.get("/", function (req, res, next) {
  // res.render("index", { title: "Express" });
  let sql = "SELECT * FROM tb_book";
  conn.query(sql, [], (err, resp, field) => {
    if (err) {
      res.send(err);
    }
    res.render("index", { title: "Express", data: resp });
  });
});

//get all data
router.get("/getall", (req, res) => {
  let sql = "SELECT * FROM tb_book";
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

//insert data
router.post("/insert", (req, res, next) => {
  upload.single("files")(req, res, function (error) {
    if (error) {
      if (error.code == "LIMIT_FILE_SIZE") {
        error.message = "File Size โคตรใหญ่ เปลืองพื้นมาก ห้ามเกิน 2MB จ้าแม่";
        error.success = false;
      }
      return res.status(500).json(error);
    } else {
      let { book_name, book_description, book_url } = req.body;
      if (!req.file) {
        var book_image = "";
      } else {
        var book_image = req.file.filename;
      }
      console.log(req.body);
      console.log(req.file);

      if (book_name && book_description && book_url && book_image) {
        let sql =
          "INSERT INTO tb_book (book_name, book_description, book_url, book_image) VALUES (?,?,?,?)";
        conn.query(
          sql,
          [book_name, book_description, book_url, book_image],
          (err, resp, field) => {
            if (resp) {
              console.log("Inserted " + book_name);
              return res.status(200).json({
                status: 200,
                message: "Inserted",
              });
            } else {
              console.log("failed: " + err.message);
            }
          }
        );
      } else {
        return res.status(400).json({
          status: 400,
          message: "ต้องกรอกทุกฟิลด์",
        });
      }
    }
  });
});

//update data some value
router.put("/update2", (req, res) => {
  upload.single("editfiles")(req, res, function (error) {
    if (error) {
      if (error.code == "LIMIT_FILE_SIZE") {
        error.message = "File Size โคตรใหญ่ เปลืองพื้นมาก ห้ามเกิน 2MB จ้าแม่";
        error.success = false;
      }
      return res.status(500).json(error);
    } else {
      let { BookId, book_name, book_description } = req.body;
      function getImage() {
        return new Promise((resolve, reject) => {
          if (!req.file) {
            //conn.query เป็นการเรียกใช้ฟังก์ชันแบบ asynchronous
            let sql =
              "SELECT book_id, book_image FROM tb_book WHERE book_id = ?";
            conn.query(sql, [BookId], (err, resp, field) => {
              if (resp) {
                let book_image = resp[0].book_image;
                resolve(book_image);
              } else {
                reject("Error fetching image");
              }
            });
          } else {
            let book_image = req.file.filename;
            resolve(book_image);
          }
        });
      }
      //เรียกฟังก์ชัน getImage
      getImage()
        .then((book_image) => {
          console.log(book_image);
          if (book_name && book_description && book_url && book_image) {
            let sql =
              "UPDATE tb_book SET book_name =?, book_description =?, book_url =?, book_image =? WHERE book_id =?";
            conn.query(
              sql,
              [book_name, book_description, book_url, book_image, parseInt(BookId)],
              (err, resp, field) => {
                if (resp) {
                  console.log("Update Success " + book_name);
                  return res.status(200).json({
                    status: 200,
                    message: "Update Success",
                  });
                } else {
                  console.log("failed: " + err.message);
                }
              }
            );
          } else {
            return res.status(400).json({
              status: 400,
              message: "ต้องกรอกทุกฟิลด์",
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
});

//delete data some value
router.delete("/delete", (req, res) => {
  let book_id = _.get(req, ["body", "book_id"]);
  console.log("test"+book_id);
  let sql = "DELETE FROM tb_book WHERE book_id =?";
  if (book_id) {
    conn.query(sql, [parseInt(book_id)], (err, data, field) => {
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

module.exports = router;
