
const Sequelize = require('sequelize');
const DataTypes= require('sequelize');
const sequelize = new Sequelize('livresque', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

// Définir les modèles pour les tables
const Author = sequelize.define('author', {
  name: Sequelize.STRING
});

const Book = sequelize.define('book', {
  title: Sequelize.STRING,
  isbn: Sequelize.STRING,
  publishedDate: Sequelize.DATE,
  image: Sequelize.STRING,
  synopsis: Sequelize.TEXT,
  pages: Sequelize.INTEGER,
  language: Sequelize.STRING,
  
  
});

const BookAuthor = sequelize.define('books_authors', {
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Book,
        key: 'id',
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Author,
        key: 'id',
      },
    },
  });
  
 
  

const Genre = sequelize.define('genre', {
  name: Sequelize.STRING
});

const BookGenre = sequelize.define('book_genre', {
bookId: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: Book,
    key: 'id',
  },
},
genreId: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: Genre,
    key: 'id',
  },
},
});


const Publisher = sequelize.define('publisher', {
  name: Sequelize.STRING,
 
});



const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
 
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const UserBook = sequelize.define('userbooks', {
 
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User, 
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.INTEGER,
    references: {
      model: Book, 
      key: 'id'
    }
  },
  favoris: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  });

// Définir les relations entre les tables

Book.belongsToMany(Author, { through: BookAuthor });
Author.belongsToMany(Book, { through: BookAuthor });

Book.belongsToMany(Genre, { through: BookGenre });
Genre.belongsToMany(Book, { through: BookGenre });

Publisher.hasMany(Book);
Book.belongsTo(Publisher);

User.belongsToMany(Book, { through: UserBook});
Book.belongsToMany(User, { through: UserBook});

 /* sequelize.sync({force: true})  */

// Exporter les modèles
module.exports = {
  sequelize,
  Author,
  Book,
  BookAuthor,
  Genre,
  BookGenre,
  Publisher,
  User,
  UserBook
};