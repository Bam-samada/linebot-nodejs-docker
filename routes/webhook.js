require("dotenv").config();
const express = require("express"); // เรียกใช้งาน express  mudule
const https = require("https");
const router = express.Router(); // กำหนด router instance ให้กับ express.Router class
const mysql = require("mysql2");
const TOKEN = process.env.LINE_TOKEN;

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

// กำหนด route หลัก หรือ root route
router.get("/", function (req, res) {
  res.send("Hollo Webhook");
});

router.post("/webhook", (req, res) => {
  console.log("req.body =>", JSON.stringify(req.body, null, 2)); //สิ่งที่ Line ส่งมา
  res.send("HTTP POST request sent to the webhook URL!");

  if (req.body.events[0].type === "message") {
    // Message data, must be stringified
    let messageType = req.body.events[0].message.type;
    // console.log(req.body.events[0].message.type);
    //messageType Text Message
    if (messageType === "text00") {
      let sql = "SELECT * FROM tb_book";
      conn.query(sql, [], (err, resp, field) => {
        if (err) {
          console.log("failed: " + err.message);
          return res.status(400).json({
            status: 400,
            message: "Bad: " + err.message,
          });
        }

        if (resp.length > 0) {
          let dataText = resp[0].name;
          // Assuming valueText is declared somewhere earlier in your code
          let valueText = dataText;

          let dataString = JSON.stringify({
            replyToken: req.body.events[0].replyToken,
            messages: [
              {
                type: "text",
                text: valueText,
              },
              {
                type: "text",
                text: "Message",
              },
            ],
          });

          dataName(dataString);
          // Now you can use dataString as needed
        } else {
          console.log("No data found");
          // Handle case where no data is returned
        }
      });
      function dataName(dataString) {
        requestMessage(dataString);
      }
    }
    //messageType Sticker Message
    if (messageType === "sticker00") {
      let sql = "SELECT * FROM tb_book";
      conn.query(sql, [], (err, resp, field) => {
        if (err) {
          console.log("failed: " + err.message);
          return res.status(400).json({
            status: 400,
            message: "Bad: " + err.message,
          });
        }
        bubbleData = [];
        if (resp.length > 0) {
          for (let index = 0; index < resp.length; index++) {
            // console.log(resp[index].name);
            bubbleData.push({
              type: "bubble",
              hero: {
                type: "image",
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover",
                url:
                  "https://line.rmutt.ac.th/uploads/" +
                  resp[index].book_image,
              },
              body: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: resp[index].book_name,
                    wrap: true,
                    weight: "bold",
                    size: "xl",
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    contents: [
                      {
                        type: "text",
                        text: resp[index].book_description,
                        wrap: true,
                        weight: "bold",
                        flex: 0,
                        size: "sm",
                        color: "#aaaaaa",
                      },
                    ],
                  },
                ],
              },
              footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                  {
                    type: "button",
                    style: "primary",
                    action: {
                      type: "uri",
                      label: "ดูรายการ",
                      uri: "https://test.com",
                    },
                  },
                ],
              },
            });
          }
          let dataString = JSON.stringify({
            replyToken: req.body.events[0].replyToken,
            messages: [
              {
                type: "flex",
                altText: "List",
                contents: {
                  type: "carousel",
                  contents: bubbleData,
                },
              },
            ],
          });

          dataName(dataString);
          // Now you can use dataString as needed
        } else {
          console.log("No data found");
          // Handle case where no data is returned
        }
      });
      function dataName(dataString) {
        requestMessage(dataString);
      }
    }
    // let dataString = JSON.stringify({
    //   replyToken: req.body.events[0].replyToken,
    //   // message image
    //   messages: [
    //     {
    //       type: "image",
    //       originalContentUrl:
    //         "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    //       previewImageUrl:
    //         "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    //     },

    //     //   video
    //     //   {
    //     //     type: "video",
    //     //     originalContentUrl: "https://example.com/original.mp4",
    //     //     previewImageUrl: "https://example.com/preview.jpg",
    //     //     trackingId: "track-id",
    //     //   },

    //     //  audio
    //     //   {
    //     //     type: "audio",
    //     //     originalContentUrl: "https://example.com/original.m4a",
    //     //     duration: 60000,
    //     //   },

    //     // location
    //     {
    //       type: "location",
    //       title: "my location",
    //       address: "1-6-1 Yotsuya, Shinjuku-ku, Tokyo, 160-0004, Japan",
    //       latitude: 35.687574,
    //       longitude: 139.72922,
    //     },

    //     // flex from bot desinger
    //     {
    //       type: "template",
    //       altText: "this is a confirm template",
    //       template: {
    //         type: "confirm",
    //         text: "Are you sure?",
    //         actions: [
    //           {
    //             type: "message",
    //             label: "Yes",
    //             text: "yes",
    //           },
    //           {
    //             type: "message",
    //             label: "No",
    //             text: "no",
    //           },
    //         ],
    //       },
    //     },
    //     // message flex from flex simulator
    //     {
    //       type: "flex",
    //       altText: "List",
    //       contents: {
    //         type: "carousel",
    //         contents: [
    //           {
    //             type: "bubble",
    //             hero: {
    //               type: "image",
    //               size: "full",
    //               aspectRatio: "20:13",
    //               aspectMode: "cover",
    //               url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_5_carousel.png",
    //             },
    //             body: {
    //               type: "box",
    //               layout: "vertical",
    //               spacing: "sm",
    //               contents: [
    //                 {
    //                   type: "text",
    //                   text: "Arm Chair, White",
    //                   wrap: true,
    //                   weight: "bold",
    //                   size: "xl",
    //                 },
    //                 {
    //                   type: "box",
    //                   layout: "baseline",
    //                   contents: [
    //                     {
    //                       type: "text",
    //                       text: "$49",
    //                       wrap: true,
    //                       weight: "bold",
    //                       size: "xl",
    //                       flex: 0,
    //                     },
    //                     {
    //                       type: "text",
    //                       text: ".99",
    //                       wrap: true,
    //                       weight: "bold",
    //                       size: "sm",
    //                       flex: 0,
    //                     },
    //                   ],
    //                 },
    //               ],
    //             },
    //             footer: {
    //               type: "box",
    //               layout: "vertical",
    //               spacing: "sm",
    //               contents: [
    //                 {
    //                   type: "button",
    //                   style: "primary",
    //                   action: {
    //                     type: "uri",
    //                     label: "Add to Cart",
    //                     uri: "https://linecorp.com",
    //                   },
    //                 },
    //                 {
    //                   type: "button",
    //                   action: {
    //                     type: "uri",
    //                     label: "Add to wishlist",
    //                     uri: "https://linecorp.com",
    //                   },
    //                 },
    //               ],
    //             },
    //           },
    //           {
    //             type: "bubble",
    //             hero: {
    //               type: "image",
    //               size: "full",
    //               aspectRatio: "20:13",
    //               aspectMode: "cover",
    //               url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_6_carousel.png",
    //             },
    //             body: {
    //               type: "box",
    //               layout: "vertical",
    //               spacing: "sm",
    //               contents: [
    //                 {
    //                   type: "text",
    //                   text: "Metal Desk Lamp",
    //                   wrap: true,
    //                   weight: "bold",
    //                   size: "xl",
    //                 },
    //                 {
    //                   type: "box",
    //                   layout: "baseline",
    //                   flex: 1,
    //                   contents: [
    //                     {
    //                       type: "text",
    //                       text: "$11",
    //                       wrap: true,
    //                       weight: "bold",
    //                       size: "xl",
    //                       flex: 0,
    //                     },
    //                     {
    //                       type: "text",
    //                       text: ".99",
    //                       wrap: true,
    //                       weight: "bold",
    //                       size: "sm",
    //                       flex: 0,
    //                     },
    //                   ],
    //                 },
    //                 {
    //                   type: "text",
    //                   text: "Temporarily out of stock",
    //                   wrap: true,
    //                   size: "xxs",
    //                   margin: "md",
    //                   color: "#ff5551",
    //                   flex: 0,
    //                 },
    //               ],
    //             },
    //             footer: {
    //               type: "box",
    //               layout: "vertical",
    //               spacing: "sm",
    //               contents: [
    //                 {
    //                   type: "button",
    //                   flex: 2,
    //                   style: "primary",
    //                   color: "#aaaaaa",
    //                   action: {
    //                     type: "uri",
    //                     label: "Add to Cart",
    //                     uri: "https://linecorp.com",
    //                   },
    //                 },
    //                 {
    //                   type: "button",
    //                   action: {
    //                     type: "uri",
    //                     label: "Add to wish list",
    //                     uri: "https://linecorp.com",
    //                   },
    //                 },
    //               ],
    //             },
    //           },
    //           {
    //             type: "bubble",
    //             body: {
    //               type: "box",
    //               layout: "vertical",
    //               spacing: "sm",
    //               contents: [
    //                 {
    //                   type: "button",
    //                   flex: 1,
    //                   gravity: "center",
    //                   action: {
    //                     type: "uri",
    //                     label: "See more",
    //                     uri: "https://linecorp.com",
    //                   },
    //                 },
    //               ],
    //             },
    //           },
    //         ],
    //       },
    //     },
    //     // message quick reply
    //     {
    //       type: "text", // 1
    //       text: "Select your favorite food category or send me your location!",
    //       quickReply: {
    //         items: [
    //           {
    //             type: "action",
    //             action: {
    //               type: "cameraRoll",
    //               label: "Send photo",
    //             },
    //           },
    //           {
    //             type: "action",
    //             action: {
    //               type: "camera",
    //               label: "Open camera",
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // });
    // requestMessage(dataString);

    // console.log(messageType);
  }

  //messageType beacon Message
  if (req.body.events[0].type === "beacon") {
    if (req.body.events[0].beacon.hwid === "0172667293") {
      let dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            type: "text",
            text: "Message",
          },
        ],
      });
      requestMessage(dataString);
    }
  }
  // Request header
  function requestMessage(dataString) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    };

    // Options to pass into the request
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };

    // Define request
    const request = https.request(webhookOptions, (res) => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    request.on("error", (err) => {
      console.error(err);
    });

    // Send data

    console.log(dataString);
    request.write(dataString);
    request.end();
  }
});

module.exports = router; // ส่ง router ที่เราสร้าง ออกไปใช้งานภายนอกไฟล์
