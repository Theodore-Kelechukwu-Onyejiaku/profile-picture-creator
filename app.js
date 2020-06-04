const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const Jimp = require("jimp");

//configuring dotenv
require("dotenv").config();

//Connecting to MongoDB Database
mongoose
  .connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Success connecting to database");
  })
  .catch(() => {
    console.error("Error connecting to database");
  });

//Importing Image Model
const Image = require("./models/Images.model");

//Configuring EJS template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

//Static Pages
app.use(express.static("public"));

/**
 *  GET REQUESTS
 */

//Main Route
app.get("/", (req, res) => {
  res.render("index.ejs");
});

//All pictures
app.get("/pictures", (req, res) => {
  Image.find()
    .then((image) => {
      setTimeout(() => {
        res.render("allPictures", { img: image });
      }, 1000);
    })
    .catch((err) => {
      res.render("allPictures", { message: "Can't find any image" });
    });
});

//Single Picutures
app.get("/single", (req, res) => {
  Image.find()
    .then((image) => {
      setTimeout(() => {
        res.render("singlePicture", { img: image });
      }, 1000);
    })
    .catch((err) => {
      res.render("singlePicture", { message: "Can't find any image" });
    });
});

//Wild Card route
app.get("*", (req, res) => {
  res.redirect("/");
});

/**
 *  POST REQUESTS
 */

//Setting up images storage
let storage = multer.diskStorage({
  //destination: "./public/uploads/images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".png");
  },
});

let upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

//Function to check file type
function checkFileType(file, cb) {
  const fileTypes = /jpg|png|gif|jpeg/;
  const extname = fileTypes.test(
    path.extname(file.originalname).toLocaleLowerCase()
  );

  if (extname) {
    return cb(null, true);
  } else {
    cb("Error: Please images only.");
  }
}

//upload single image
app.post("/uploadSingle", upload.single("url"), (req, res, next) => {
  const file = req.file;

  if (!file) {
    console.log("Please select an image");
    return res.render("error page", { error: "Please select an image" });
  }

  //This removes the public from the file path, so we will have only "/uploads/images/*.jpg|png|gif"
  let Imgurl = file.path.replace("public", "");

  //To check for duplicate files in the database
  Image.findOne({ url: Imgurl })
    .then((img) => {
      if (img) {
        console.log("Duplicate Image, try again!");
        return res.redirect("/");
      } else {
        const image = new Image();
        image.username = req.body.username;
        image.stack = req.body.stack;

        //Beginning of JIMP
        let imgRaw = req.file.path; //This is the image that was posted from our form
        let imgLogo = "06.jpg"; //This is the logo
        let imgExported = "public/uploads/" + Date.now() + ".png";

        let textData = {
          text: req.body.username, //the text to be rendered on the image
          maxWidth: 100, //Maximum width of text
          maxHeight: 0, //Maximum height of text
          placementX: 100, // Placement from x-axis
          placementY: Jimp.VERTICAL_ALIGN_BOTTOM, //bottom of the image: height - maxHeight - margin
        };

        Jimp.read(imgRaw).then((tpl) =>
          Jimp.read(imgLogo)
            .then((logoTpl) => {
              logoTpl.opacity(1);
              logoTpl.resize(50, 50);
              logoTpl.circle();

              //normal
              function first() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //greyscale
              function second() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .greyscale()
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              function three() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .rotate(-5)
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //flip
              function four() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .flip(true, false)
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //blur
              function five() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .blur(5)
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //color spin
              function six() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .color([{ apply: "spin", params: [50] }])
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //posterize
              function seven() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .posterize(7)
                  .color([{ apply: "spin", params: [50] }])
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //fish eye
              function eight() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .posterize(7)
                  .fisheye()
                  .color([{ apply: "spin", params: [50] }])
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //shadow
              function nine() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .posterize(7)
                  .shadow()
                  .color([{ apply: "spin", params: [50] }])
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

              //normal
              function ten() {
                return tpl
                  .quality(0)
                  .resize(300, 300)
                  .threshold({ max: 150 })
                  .composite(logoTpl, 20, 20, [
                    Jimp.BLEND_DESTINATION_OVER,
                    0.2,
                    0.2,
                  ]);
              }

    
              var anyNo = Math.floor(Math.random() * 10) + 1;
              if (anyNo === 7) {
                return seven();
              } else if (anyNo === 6) {
                return six();
              } else if (anyNo === 5) {
                return five();
              } else if (anyNo === 4) {
                return four();
              } else if (anyNo === 3) {
                return three();
              } else if (anyNo === 2) {
                return second();
              } else if (anyNo === 8) {
                return eight();
              } else if (anyNo === 9) {
                return nine();
              } else if (anyNo === 10) {
                return ten();
              } else {
                return first();
              }
            })

            //load font
            .then((tpl) =>
              Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then((font) => [tpl, font])
            )

            //add footer text
            .then((data) => {
              tpl = data[0];
              font = data[1];

              return tpl.print(
                font,
                textData.placementX,
                textData.placementY,
                {
                  text: textData.text,
                  alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                  alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
                },
                textData.maxWidth,
                textData.maxHeight
              );
            })

            //export image
            .then((tpl) => tpl.quality(100).write(imgExported))

            //log exported filename
            .then((tpl) => {
              console.log("exported file: " + imgExported);
            })

            //catch errors
            .catch((err) => {
              console.error(err);
            })
        );

        image.url = path.basename(imgExported);
        image
          .save()
          .then(() => {
            console.log("image saved to database");
            res.redirect("/single");
          })
          .catch((err) => {
            console.error(err);
          });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server running successfully");
});
