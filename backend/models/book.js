const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    //Schema à revoir après la connexion (vérifier si tout est bien initialisé)
  id: { type: Number, required: true },
  //userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  genre: { type: String, required: true },
  grade : { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);