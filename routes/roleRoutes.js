const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getAllRoles } = require('../controllers/roleController');

router.get('/', authenticateToken, authorizeRole(['owner','admin']), getAllRoles);

module.exports = router;