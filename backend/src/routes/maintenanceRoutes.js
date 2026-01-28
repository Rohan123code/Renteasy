const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.post('/', maintenanceController.createMaintenanceRequest);
router.get('/', maintenanceController.getUserMaintenanceRequests);
router.get('/all', maintenanceController.getAllMaintenanceRequests);
router.put('/:id', maintenanceController.updateMaintenanceRequest);

module.exports = router;