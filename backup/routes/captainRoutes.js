const express = require('express');
const router = express.Router();
const captainController = require('../controllers/captainController');

router.get('/', captainController.getAllCaptains);
router.post('/', captainController.createCaptain);
router.put('/:id', captainController.updateCaptain);
router.delete('/:id', captainController.deleteCaptain);

module.exports = router;
