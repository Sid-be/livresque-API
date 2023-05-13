
const bookRoutes=require('./routes/book.js');
const userRoutes=require('./routes/auth.js');
const coverRoute=require('./routes/cover.js');
const helmet = require("helmet")
const path = require('path');
const cors=require('cors');
const express=require('express');
const bodyParser=require('body-parser');
const app=express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json());
app.use(cors());
app.use(helmet());
const imagesPath = path.join(__dirname, 'images');
app.use('/image', express.static(imagesPath));
app.use('/api/book', bookRoutes);
app.use('/auth', userRoutes);
app.use('/api/isbn', coverRoute)
    
module.exports=app;