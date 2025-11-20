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

// GET /api/casefiles/:id
router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR', 'TECHNICIAN']),
  caseFileController.getCaseFileById
);

// POST /api/casefiles/:id/send-to-review
router.post(
  '/:id/send-to-review',
  authenticate,
  authorize(['ADMIN', 'TECHNICIAN']),
  caseFileController.sendToReview
);

// POST /api/casefiles/:id/approve
router.post(
  '/:id/approve',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR']),
  caseFileController.approveCaseFile
);

// POST /api/casefiles/:id/reject
router.post(
  '/:id/reject',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR']),
  caseFileController.rejectCaseFile
);

// PUT /api/casefiles/:id
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'TECHNICIAN']),
  caseFileController.updateCaseFile
);

// DELETE /api/casefiles/:id
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  caseFileController.deleteCaseFile
);

module.exports = router;
