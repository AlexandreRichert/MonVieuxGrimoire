const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');

const booksRoutes = require('./routes/books');

mongoose.connect('mongodb+srv://firstuser:DQ3gWJZZ7KjS1tzL@cluster0.vdthjca.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;

