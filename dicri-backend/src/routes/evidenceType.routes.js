const express = require('express');
const router = express.Router();
const evidenceTypeController = require('../controllers/evidenceType.controller');

// GET /api/catalogs/evidence-types
router.get('/', evidenceTypeController.getEvidenceTypes);

module.exports = router;
