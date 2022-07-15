/**
 * access to the Royalty
 */

const express = require('express');
const router = express.Router();
const royaltyController = require('../controllers/royalty');

router.get('/info', royaltyController.info)
router.get('/', royaltyController.list);
router.get('/list', royaltyController.list);
router.get('/recalc', royaltyController.recalc);
router.get('/artists', royaltyController.artists);
router.get('/errors', royaltyController.errors);
module.exports = router;
