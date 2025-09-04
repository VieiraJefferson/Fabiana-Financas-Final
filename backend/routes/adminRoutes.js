const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController.js');
const { requireAuth, requireRole, requireAdmin } = require('../middleware/adminMiddleware.js');

// Rotas públicas de admin
router.post('/login', ctrl.adminLogin);

// Rotas protegidas de admin
router.get('/me', requireAuth(), requireRole('admin'), ctrl.adminMe);
router.post('/logout', requireAuth(), requireRole('admin'), ctrl.adminLogout);

// Rotas que precisam de role admin
router.get('/users', requireAuth(), requireRole('admin'), ctrl.listUsers);
router.get('/users/:id', requireAuth(), requireRole('admin'), ctrl.getUserById);
router.put('/users/:id', requireAuth(), requireRole('admin'), ctrl.updateUser);
router.patch('/users/:id/toggle-status', requireAuth(), requireRole('admin'), ctrl.toggleUserStatus);
router.post('/users/:id/revoke-sessions', requireAuth(), requireRole('admin'), ctrl.revokeUserSessions);

// Estatísticas do sistema (apenas admin)
router.get('/stats', requireAuth(), requireRole('admin'), ctrl.getSystemStats);

module.exports = router; 