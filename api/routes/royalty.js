/**
 * access to the Royalty
 */

const express = require('express');
const router = express.Router();
const royaltyController = require('../controllers/royalty');

router.get('/info', royaltyController.info)
router.get('/', royaltyController.list);
router.get('/list', royaltyController.list);

module.exports = router;
