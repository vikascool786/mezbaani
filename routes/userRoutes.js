const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require("../middleware/auth");

router.post('/', authenticateToken, authorizeRole(['owner','admin']), userController.createStaff);

module.exports = router;
