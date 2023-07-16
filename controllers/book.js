const { sequelize, Author, Book, Genre, Publisher, User,BookAuthor,BookGenre, UserBook } = require('../models/Book');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_KEY='a7c84f57d0c459a57962bc26f6a69f22b4202efad3c4049ce0486eea626e4683c9f9037f77a98367c55309df5d9ec127b4275b33ab3d92e5742af57eecc45eeb'

exports.createBook= async (req, res) => {
  console.log(req.userId);
  const userId = req.userId;

  let transaction;
  try {
    
    transaction = await sequelize.transaction();

  
    const authorIds = [];
    for (const authorName of req.body.authors) {
      const [author] = await Author.findOrCreate({
        where: { name: authorName },
        transaction,
      });
      authorIds.push(author.id);
    }

    const genreIds = [];
    for (const genreName of req.body.genre) {
      const [genre] = await Genre.findOrCreate({
        where: { name: genreName },
        transaction,
      });
      genreIds.push(genre.id);
    }
    // Insérer le nouveau publisher
    console.log(req.body.publisher)
    const [publisher] = await Publisher.findOrCreate({
      where: {
        name: req.body.publisher,
      },
      transaction,
    });

    // Insérer le nouveau livre
    const imageSrc = req.body.isbn + ".jpg";
    const imagesPath = path.join(__dirname, "images");

    const imageUrl = `${req.protocol}://${req.headers.host}/image/${imageSrc}`;

    const newBook = await Book.create(
      {
        title: req.body.title,
        isbn: req.body.isbn,
        publishedDate: req.body.publishedDate,
        image: imageUrl,
        synopsis: req.body.synopsis,
        pages: req.body.pages,
        language: req.body.langage,
        publisherId: publisher.id,
      },
      { transaction }
    );

    // Insérer les enregistrements dans la table books_authors
    const booksAuthors = authorIds.map((authorId) => ({
      bookId: newBook.id,
      authorId: authorId,
    }));
    await BookAuthor.bulkCreate(booksAuthors, { transaction });

    const booksGenre = genreIds.map((genreId) => ({
      bookId: newBook.id,
      genreId: genreId,
    }));

    await BookGenre.bulkCreate(booksGenre, { transaction });

    if (req.body.favoris) {
      favoris = req.body.favoris;
    }
    const userBook = {
      bookId: newBook.id,
      UserId: userId,
      favoris: favoris,
    };

  
    await UserBook.create(userBook, { transaction });

    // Valider la transaction
    await transaction.commit();

    // Retourner le nouvel objet Book sous forme de réponse JSON
    res.status(201).json(newBook);
  } catch (err) {
    // Annuler la transaction en cas d'erreur
    if (transaction) await transaction.rollback();

    console.error(err);
    res
      .status(500)
      .send("Une erreur est survenue lors de l'insertion du livre.");
  }
};
exports.getBooksByGenre=async(req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")){
 
    
   
     
      const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
    console.log(books)
      return res.status(401).json(books );
    }
  try {
    const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, JWT_KEY);
  const userId = decodedToken.id;
  const genre=req.params.genre
  console.log(req.params.genre)
  const currentUser = await User.findOne({ where: { id: userId } });
  const books = await currentUser.getBooks({
    include: [
      { model: Genre, as: "genres", attributes:["name"] }
     
      
    ],
    where: {
      "$genres.name$": genre // Utiliser le genre dans la condition de recherche
    }
 
  });

  res.json(books);
} catch(error){
  console.log(error)
  if (error.name === 'TokenExpiredError') {
  const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
  res.json(books);
} else {

  console.log('here')
  res.status(401).json({ error: 'Token invalide' });
} 
}
}
exports.giveBooks=async(req, res, next) => {
  const authorizationHeader = req.headers.authorization;
if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")){
  
 
  
    const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
  
    return res.status(200).json(books );
  }
  try {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, JWT_KEY);
  const userId = decodedToken.id;
  const currentUser = await User.findOne({ where: { id: userId } });
  const books = await currentUser.getBooks({
    order: [["createdAt", "DESC"]],
  });

  res.json(books);
} catch(error){if (error.name === 'TokenExpiredError') {
  const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
  res.json(books);
} else {
  // Gérer d'autres erreurs liées au décodage du jeton JWT
  res.status(401).json({ error: 'Token invalide' });
} 
}
}
exports.getOneBook=async(req,res,next)=>{
 
  try{
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, JWT_KEY);
  const userId = decodedToken.id;
  const bookId=req.params.id;
  
    const oneBook= await Book.findOne({
      where:{isbn:bookId},
      include: [
        { model: Author, as: "authors", attributes:["name"] }, 
        { model: Publisher, as: "publisher",attributes:["name"] } ,
        
      ],
      attributes: { exclude: ["authorId", "publisherId"] },
    })
    oneBook.favoris = null;
    const user = await User.findOne({ where: { id:userId} });
    const book = await Book.findOne({ where: { isbn: bookId  } });
    
    const userBook = await user.getBooks({
      where: { id: book.id },
      through: { attributes: ['favoris'] }
    });
    console.log(userBook);
    const favoris = userBook[0].userbooks.favoris;
   console.log(favoris);
    const bookWithFavoris = { ...oneBook.toJSON(), favoris };
    res.json(bookWithFavoris);
  }
  catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Une erreur est survenue lors de la récupération du livre."
      );
  }
}
exports.updateBook = async (req, res, next) => {
  const userId = req.userId;
  const bookId = req.params.id;
  const { title, isbn, description, publishedDate, publisher, authors, genres,favoris } = req.body;
  try {
    const user = await User.findOne({ where: { id: userId } });
    const book = await Book.findOne({ where: { isbn: bookId } });
    if (!user || !book) {
      return res.status(404).send("Utilisateur ou livre introuvable");
    }
    // Vérifier si l'utilisateur a le livre dans sa liste
    const userBook = await user.getBooks({
      where: { id: book.id },
      through: { attributes: ['favoris'] }
    });
    if (userBook.length === 0) {
      return res.status(404).send("L'utilisateur n'a pas ce livre dans sa liste");
    }
    // Mettre à jour le livre
    await book.update({
      title,
      isbn,
      description,
      publishedDate,
      publisher,
      authors,
      genres,
      favoris
    });
    await userBook[0].userbooks.update({ favoris: req.body.favoris });
    // Récupérer le livre mis à jour
    const updatedBook = await Book.findOne({
      where: { isbn: bookId },
      include: [
        { model: Author, as: "authors", attributes: ["name"] },
        { model: Publisher, as: "publisher", attributes: ["name"] },
        { model: Genre, as: "genres", attributes: ["name"] },
       
      ],
      attributes: { exclude: ["authorId", "publisherId"] },
    });
    // Renvoyer la réponse avec le livre mis à jour
    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).send("Une erreur est survenue lors de la mise à jour du livre.");
  }
};
exports.deleteBook = async (req, res, next) => {
  const userId = req.userId;
  const bookId = req.params.id;
  try {
    // Vérifier si l'utilisateur a le livre dans sa liste
    const user = await User.findOne({ where: { id: userId } });
    const book = await Book.findOne({ where: { isbn: bookId } });
    if (!user || !book) {
      return res.status(404).send("Utilisateur ou livre introuvable");
    }
    const userBook = await user.getBooks({
      where: { id: book.id },
      through: { attributes: ['favoris'] }
    });
    if (userBook.length === 0) {
      return res.status(404).send("L'utilisateur n'a pas ce livre dans sa liste");
    }
    // Supprimer le livre de la table userbooks
    await user.removeBook(book);
    // Supprimer le livre de la table books
    /* await book.destroy(); */
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Une erreur est survenue lors de la suppression du livre.");
  }
};
