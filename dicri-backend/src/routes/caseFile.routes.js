const express = require('express');
const router = express.Router();
const caseFileController = require('../controllers/caseFile.controller');
const evidenceController = require('../controllers/evidence.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// GET /api/casefiles/:caseFileId/history
router.get(
  '/:caseFileId/history',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR', 'TECHNICIAN']),
  caseFileController.getCaseFileHistory
);

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

// POST /api/casefiles/:caseFileId/evidences
router.post(
  '/:caseFileId/evidences',
  authenticate,
  authorize(['ADMIN', 'TECHNICIAN']),
  evidenceController.createEvidenceForCaseFile
);

// GET /api/casefiles/:caseFileId/evidences
router.get(
  '/:caseFileId/evidences',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR', 'TECHNICIAN']),
  evidenceController.getEvidencesForCaseFile
);

// GET /api/casefiles/:id
router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR', 'TECHNICIAN']),
  caseFileController.getCaseFileById
);

module.exports = router;
