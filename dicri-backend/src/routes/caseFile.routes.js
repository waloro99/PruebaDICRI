const express = require('express');
const router = express.Router();
const caseFileController = require('../controllers/caseFile.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// POST /api/casefiles
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'TECHNICIAN']),
  caseFileController.createCaseFile
);

// GET /api/casefiles
router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR', 'TECHNICIAN']),
  caseFileController.getCaseFiles
);

module.exports = router;
