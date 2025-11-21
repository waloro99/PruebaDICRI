const express = require('express');
const router = express.Router();

const caseStatusRoutes = require('./caseStatus.routes');
const authRoutes = require('./auth.routes');
const roleRoutes = require('./roles.routes');
const userRoutes = require('./user.routes');
const caseFileRoutes = require('./caseFile.routes');
const evidenceRoutes = require('./evidence.routes');

router.use('/catalogs/case-statuses', caseStatusRoutes);
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/casefiles', caseFileRoutes);
router.use('/evidences', evidenceRoutes);

module.exports = router;
