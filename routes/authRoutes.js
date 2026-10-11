const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getUsers);
router.put('/users/:id/status', authController.toggleUserStatus);
router.put('/users/:id', authController.updateUser);
router.get('/stats', authController.getStats);

module.exports = router;