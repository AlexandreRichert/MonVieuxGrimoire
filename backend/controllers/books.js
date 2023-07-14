
const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

//Ajout d'un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const imagePath = req.file.path;

  // Chemin de destination pour l'image redimensionnée
  const resizedImagePath = `${req.file.destination}/resized_${req.file.filename}`;

  // Redimensionner l'image avec Sharp
  sharp(imagePath)
    .resize(800, 600) // Définissez les dimensions souhaitées pour l'image redimensionnée
    .toFile(resizedImagePath)
    .then(() => {
      const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
        averageRating: bookObject.ratings[0].grade
      });
      book.save()
      .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
      .catch(error => { res.status(400).json({ error }) });
  })
  .catch(error => {
    res.status(500).json({ error });
  });
};

//Modification d'un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
} : { ...req.body };
delete bookObject._userId;
//Récupération du livre sélectionné
Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message : 'Not authorized'});
        } else {
            Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
}

//Suppression d'un livre
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
    });
}

//Affichage du livre cliqué
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}

//Affichage de tous les livres publiés
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}

//Notation d'un livre+affichage de la moyenne des notes 
exports.ratingBook = (req, res, next) => {
    let userConnected = req.body.userId;
    let grade = req.body.rating;
    console.log(userConnected);
    console.log(grade);

    Book.findOne({ _id: req.params.id })
    .then((book) => {
        // Vérifier si l'utilisateur est l'auteur du livre
        /*if (book.userId === userConnected) {
            return res.status(401).json({ message: "Vous avez publié ce livre. Vous n'êtes pas autorisé à le noter" });
        }*/
        const userRatingIndex = book.ratings.findIndex((rating) => rating.userId === userConnected);
        if (userRatingIndex !== -1) {
             // à tester si chaîne de caractères
            return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
        }
        else {
            const newRating = {
                userId: userConnected,
                grade: grade,
            };
            const updatedRatings = [
                    ...book.ratings,
                    newRating
                    ];

            const gradesSum = updatedRatings.reduce((sum, rating) => sum + rating.grade, 0);
            const averageGrade = gradesSum / updatedRatings.length;

            book.ratings = updatedRatings;
            book.averageRating = averageGrade;
            console.log(updatedRatings);
            console.log(averageGrade);

            return book.save();
                /*.then(() => {
                    res.status(200).json({ message: "Note enregistrée avec succès", book });
                })                
                .catch((error) => {
            res.status(500).json({ error });
                });*/

            }
        })
        .then(book => {
            console.log('Book saved:', book);
            res.status(201).json(book);
          })
          .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'évaluation du livre.' });
          });
      };


//Affichage des 3 livres les mieux notés
exports.getBestBooks = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(401).json({ error }));
};


