
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file');

router.get('/image', fileController.hello)
router.get('/image/:boardId/:elementId/:index?', fileController.image);

module.exports = router;
