const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// GET /api/users
router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  userController.getUsers
);

// GET /api/users/:id
router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'COORDINATOR']),
  userController.getUserById
);

// POST /api/users
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  userController.createUser
);

// PUT /api/users/:id
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  userController.updateUser
);

// PATCH /api/users/:id/status
router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  userController.updateUserStatus
);

module.exports = router;
