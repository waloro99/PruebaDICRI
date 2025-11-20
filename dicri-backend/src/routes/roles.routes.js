const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');

// GET /api/roles
router.get('/', roleController.getRoles);

module.exports = router;
