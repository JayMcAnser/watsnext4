/**
 * access for mediakunst definitions
 */

const express = require('express');
const router = express.Router();
const mediakunstController = require('../controllers/mediakunst');

router.get('/', mediakunstController.info);
router.get('/art', mediakunstController.listArt)


module.exports = router;
