/**
 * access to the api
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');


router.post('/register', authController.create);
router.post('/', authController.authenticate);
router.post('/refresh', authController.refresh)

module.exports = router;
