/**
 * access to the Art
 */

const express = require('express');
const router = express.Router();
const artController = require('../controllers/art');

router.get('/', artController.list);
router.get('/count', artController.count);
router.get('/id/:id', artController.id)
router.patch('/:id/:session?', artController.patch)

module.exports = router;
