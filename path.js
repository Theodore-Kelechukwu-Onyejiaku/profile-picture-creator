const Jimp = require("jimp");

//if you are following along, create the following 2 images relative to this script:
let imgRaw = '04.jpg'; //a 1024px x 1024px backgroound image
let imgLogo = '06.jpg'; //a 155px x 72px logo
//---

let imgActive = 'active/image.jpg';
let imgExported = 'export/image1.jpg';

let textData = {
  text: '© JKRB Investments Limited', //the text to be rendered on the image
  maxWidth: 1004, //image width - 10px margin left - 10px margin right
  maxHeight: 72 + 20, //logo height + margin
  placementX: 10, // 10px in on the x axis
  placementY: 700 //bottom of the image: height - maxHeight - margin 
};




//read template & clone raw image 
Jimp.read(imgRaw)
  // .then(tpl => (tpl.clone().greyscale().write(imgActive)))

  // //read cloned (active) image
  // .then(() => (Jimp.read(imgActive)))

  //combine logo into image
  .then(tpl => (
    Jimp.read(imgLogo).then(logoTpl => {
      logoTpl.opacity(1);
      logoTpl.resize(100,100);
      logoTpl.circle();
      return tpl.composite(logoTpl, 20, 20, [Jimp.BLEND_DESTINATION_OVER, 0.2, 0.2]);
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
      text: textData.text + '/n' + textData.text,
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