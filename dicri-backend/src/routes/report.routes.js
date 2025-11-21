const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// GET /api/reports/casefiles/summary 
router.get(
  '/casefiles/summary',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR']),
  reportController.getCaseFilesSummary
);

// GET /api/reports/casefiles/detail
router.get(
  '/casefiles/detail',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR']),
  reportController.getCaseFilesDetail
);

module.exports = router;
