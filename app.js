
const bookRoutes=require('./routes/book.js');
const userRoutes=require('./routes/auth.js');
const authenticate=require('./authmiddle.js');

const cors=require('cors');
const path = require('path');
const cheerio = require('cheerio');
const axios =require('axios');
const fs = require('fs');
const express=require('express');
const bodyParser=require('body-parser');
const app=express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json());
app.use(cors());
const imagesPath = path.join(__dirname, 'images');
app.use('/image', express.static(imagesPath));
app.use('/api/book', bookRoutes);
app.use('/auth', userRoutes);
app.get("/api/isbn/:id", authenticate, async (req, res, next) => {
    const isbn = req.params.id;
  
    (async () => {
      const params = {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
          "Accept-Language": "FR-fr",
        },
      };
      try {
        const response = await axios.get(
          `https://www.bookfinder.com/search/?keywords=${isbn}&currency=EUR&destination=fr&mode=isbn&lang=en&st=sh&ac=qr&submit=`,
          params
        );
        const html = response.data;
        // Use Cheerio to parse the HTML
        const $ = cheerio.load(html);
        const imggr = $("#coverImage").attr("src");
        const downloadImage = async (url, path) => {
          const response = await axios({
            method: "GET",
            url: url,
            responseType: "stream",
          });
  
          return new Promise((resolve, reject) => {
            response.data
              .pipe(fs.createWriteStream(path))
              .on("error", reject)
              .once("close", () => resolve(path));
          });
        };
  
        if (imggr) {
          const storage = `./images/${isbn}.jpg`;
  
          await downloadImage(imggr, storage)
            .then(() => console.log("image sauvegardé"))
            .catch((err) => console.log(err));
  
          const imageSrc = isbn + ".jpg";
          const imagesPath = path.join(__dirname, "images");
          const imageUrl = `${req.protocol}://${req.headers.host}/image/${imageSrc}`;
          res.status(200).json(imageUrl);
        } else {
          const imageNoImage = "No-Image-Placeholder.svg";
          const imageUrlNo = `${req.protocol}://${req.headers.host}/image/${imageNoImage}`;
          res.status(200).json(imageUrlNo);
        }
      } catch (err) {
        if (err.response) {
          console.log(err.response.status);
        }
        const imageNoImage = "No-Image-Placeholder.svg";
        const imageUrlNo = `${req.protocol}://${req.headers.host}/image/${imageSrc}`;
  
        res
          .status(500)
          .send(`Une erreur pendant le téléchargement de l'image ${err.message}`)
          .json(imageUrlNo);
      }
    })();
  });
 
module.exports=app;