/**
 * access to the Art
 */

const express = require('express');
const router = express.Router();
const artController = require('../controllers/art');

router.get('/', artController.list);

module.exports = router;
