
const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})}

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
} : { ...req.body };

delete bookObject._userId;
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

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}


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
            
            book.save()
                .then(() => {
                    res.status(200).json({ message: "Note enregistrée avec succès", averageGrade });
                })                
                .catch((error) => {
            res.status(500).json({ error });
                });

            }
        })
            .catch((error) => {
            res.status(404).json({ error });
    });
};         



