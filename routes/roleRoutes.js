const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getAllRoles, createRole } = require('../controllers/roleController');

router.post('/', createRole);
router.get('/', authenticateToken, authorizeRole(['owner','admin']), getAllRoles);

module.exports = router;