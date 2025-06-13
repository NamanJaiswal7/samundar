const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAltarShapes, createAltarShape } = require('../controllers/altarController');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.get('/', getAltarShapes);
router.post('/', upload.single('image'), createAltarShape);

module.exports = router;
