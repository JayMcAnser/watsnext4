/*
 * interfaces with the / world
 */

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/test');

router.get('/', publicController.info);

module.exports = router;
