/**
 * info about the system, user, config, etc
 */

const express = require('express');
const router = express.Router();
const infoController = require('../controllers/info');

router.get('/', infoController.general);
router.get('/models', infoController.models)


module.exports = router;
