const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const methodOverride = require("method-override");
const Jimp = require("jimp");


//configuring dotenv 
require("dotenv").config();

//Connecting to MongoDB Database
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=>{
    console.log("Success connecting to database");
}).catch(()=>{
    console.error("Error connecting to database")
})

//Importing Image Model
const Image = require("./models/Images.model")


//Configuring EJS template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs")


//Static Pages
app.use(express.static("public"));

//Cofiguring methodOVerride
app.use(methodOverride("_method"))

/**
 *  GET REQUESTS
 */

//Main Route
app.get("/", (req, res)=>{
    res.render("index.ejs");
})


//All pictures 
app.get("/pictures", (req, res)=>{

    Image.find()
        .then(image =>{
            setTimeout(()=>{ res.render("allPictures", {img : image}) }
            ,3000)
        })
        .catch(err =>{
            res.render("allPictures", {message: "Can't find any image"})
        })
})

//Wild Card route
app.get("*", (req, res)=>{
    res.redirect("/")
})


/**
 *  POST REQUESTS
 */


//Setting up images storage
let storage = multer.diskStorage({
    //destination: "./public/uploads/images",
    filename: (req, file, cb)=>{
        cb(null, Date.now()+".png")
    },
})

let upload = multer({
    storage : storage,
    fileFilter: (req, file, cb)=>{
        checkFileType(file, cb);
    }
})

//Function to check file type
function checkFileType(file, cb){
    const fileTypes = /jpg|png|gif|jpeg/;
    const extname = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());

    if(extname){
        return cb(null, true);
    }else{
        cb("Error: Please images only.");
    }
}
 
 //upload single image
 app.post("/uploadSingle", upload.single("url"), (req, res, next)=>{
    const file = req.file;

    if(!file){
        console.log("Please select an image")
        return res.render("error page", {error : "Please select an image"})
    }

   //This removes the public from the file path, so we will have only "/uploads/images/*.jpg|png|gif"
   let Imgurl = file.path.replace("public", "")

    //To check for duplicate files in the database
    Image.findOne({url : Imgurl})
        .then(img =>{
            if(img){
                console.log("Duplicate Image, try again!");
                return res.redirect("/")
            }else{

                
                const image = new Image();
                image.username = req.body.username;
                image.stack = req.body.stack;
                
                //Beginning of JIMP
                let imgRaw = req.file.path; //This is the image that was posted from our form
                let imgLogo = '06.jpg'; //This is the logo
                let imgExported = 'public/'+Date.now()+".jpg";

                let textData = {
                    text: req.body.username+":\n"+req.body.stack, //the text to be rendered on the image
                    maxWidth: 500, //Maximum width of text
                    maxHeight: 200, //Maximum height of text
                    placementX: 0, // Placement from x-axis
                    placementY: 400 //Placement from y-axis
                  };


                

                Jimp.read(imgRaw)
                .then(tpl => (
                    Jimp.read(imgLogo).then(logoTpl => {
                      logoTpl.opacity(1);
                      logoTpl.resize(100,100);
                      logoTpl.circle();
                      


                      var arr = [
                         tpl.quality(100).composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                        ,tpl.quality(100).greyscale().composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                        ,tpl.quality(100).composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                        ,tpl.quality(100).color([{apply: "hue", params: [-90]},{apply: "lighten", params: [50]},{apply: "xor", params: ["#O6D"]}]).composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                        ,tpl.quality(100).greyscale().color([{ apply: 'red', params: [100] }]).composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                        ,tpl.quality(100).greyscale().color([{ apply: "blue", params: [100] }]).composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                        ,tpl.quality(100).circle({ radius: 50, x: 25, y: 25 }).fisheye({ r: 1.6 }).composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                        
                    ]
                    
                    return  arr[0]
                    
                    })
                  )
                
                  //load font	
                  .then(tpl => (
                    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => ([tpl, font]))
                  ))
                    
                  //add footer text
                  .then(data => {
                
                    tpl = data[0];
                    font = data[1];
                  
                    return tpl.print(font, textData.placementX, textData.placementY, {
                      text: textData.text,
                      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                    }, textData.maxWidth, textData.maxHeight);
                  })
                
                  //export image
                  .then(tpl => (tpl.quality(100).write(imgExported)))
                
                  //log exported filename
                  .then(tpl => { 
                    console.log('exported file: ' + imgExported);
                    
                  })
                
                  //catch errors
                  .catch(err => {
                    console.error(err);
                  }));



                
               
                image.url = path.basename(imgExported); 
                image.save()
                    .then(()=>{
                        console.log("image saved to database");
                            res.redirect("/pictures") 
                    })
                    .catch((err)=>{
                        console.error(err);
                    })
            }
        })
        .catch(err =>{
            console.error(err);
        })

 })

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log("server running successfully");
})