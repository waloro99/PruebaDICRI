const express = require('express');
const router = express.Router();
const caseStatusController = require('../controllers/caseStatus.controller');

// GET /api/catalogs/case-statuses
router.get('/', caseStatusController.getCaseStatuses);

module.exports = router;
