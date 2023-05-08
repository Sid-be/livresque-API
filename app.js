
const bookRoutes=require('./routes/book.js');
const authenticate=require('./authmiddle.js');

const cors=require('cors');
const path = require('path');
const cheerio = require('cheerio');
const axios =require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt=(require('bcrypt'))
const express=require('express');
const { sequelize, Author, Book, Genre, Publisher, User,BookAuthor,BookGenre, UserBook } = require('./models/Book');
const bodyParser=require('body-parser');
const GOOD_READ_URL = 'https://www.goodreads.com';

const mysql = require('mysql2/promise');

const JWT_KEY='a7c84f57d0c459a57962bc26f6a69f22b4202efad3c4049ce0486eea626e4683c9f9037f77a98367c55309df5d9ec127b4275b33ab3d92e5742af57eecc45eeb'


const app=express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json());
app.use(cors());
const imagesPath = path.join(__dirname, 'images');
app.use('/image', express.static(imagesPath));
 
  app.use('/api/book', bookRoutes);
  app.use('/api/auth', bookRoutes);
  app.post('/auth/register', async (req, res) => {
    try {
      const { email,name, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ email, name,password: hashedPassword });
      res.status(201).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating user' });
    }
  });
  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ where: { email } });
  
    if (!user) {
      // L'utilisateur n'existe pas
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  
    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid) {
      // Le mot de passe est incorrect
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  
    // Création d'un JWT contenant les informations de l'utilisateur
    const token = jwt.sign({ id: user.id,name:user.name, email: user.email }, JWT_KEY, { expiresIn: '1h' });
  
    // Envoi du token dans la réponse
    res.json({ token});
  });
 
  
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