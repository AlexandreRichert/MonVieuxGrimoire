/*const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/books');

router.post('/', auth, multer, bookCtrl.createBook );
router.get('/:id', auth, bookCtrl.getOneBook );
router.put('/:id', auth, bookCtrl.modifyBook );
router.delete('/:id', auth, bookCtrl.deleteBook );
router.get('/', auth, bookCtrl.getAllBooks );


module.exports = router;*/

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const booksCtrl = require('../controllers/books');

router.post('/', auth, multer, booksCtrl.createBook);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/', booksCtrl.getAllBooks);


module.exports = router;