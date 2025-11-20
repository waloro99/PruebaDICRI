const express = require('express');
const router = express.Router();

const caseStatusRoutes = require('./caseStatus.routes');
const authRoutes = require('./auth.routes');
const roleRoutes = require('./role.routes');

router.use('/catalogs/case-statuses', caseStatusRoutes);
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);

module.exports = router;
