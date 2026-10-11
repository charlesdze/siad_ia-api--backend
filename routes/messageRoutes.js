const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const departmentController = require('../controllers/departmentController');

// Mapping des routes vers leurs fonctions de contrôle correspondantes
router.post('/messages', messageController.createMessage);
router.get('/messages', messageController.getMessages);
router.put('/messages/:id/status', messageController.updateMessageStatus);
router.get('/ai/analyse', messageController.getAIAnalyse);

// Routes pour les départements
router.get('/departments', departmentController.getAllDepartments);
router.post('/departments', departmentController.createDepartment);
router.put('/departments/:id/status', departmentController.toggleDepartmentStatus);
router.delete('/departments/:id/:name', departmentController.deleteDepartment);

module.exports = router;