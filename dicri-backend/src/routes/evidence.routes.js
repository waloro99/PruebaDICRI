const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidence.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// GET /api/evidences/:id
router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR', 'TECHNICIAN']),
  evidenceController.getEvidenceById
);

// PUT /api/evidences/:id
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'TECHNICIAN']),
  evidenceController.updateEvidence
);

// DELETE /api/evidences/:id
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  evidenceController.deleteEvidence
);

module.exports = router;
