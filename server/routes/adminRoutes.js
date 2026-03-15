const express = require('express');
const router = express.Router();
const { getUsersReport, deleteUser, createTask, updateTask, deleteTask, createStaff } = require('../controllers/adminController');
const { authMiddleware, authorize } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');

const staffSchema = {
    username: { required: true, minLength: 3 },
    email: { required: true, isEmail: true },
    password: { required: true, minLength: 6 }
};

const taskSchema = {
    title: { required: true },
    points: { required: true, isNumeric: true }
};

router.get('/users', authMiddleware, authorize('admin'), getUsersReport);
router.delete('/users/:id', authMiddleware, authorize('admin'), deleteUser);

// Staff Management
router.post('/staff', authMiddleware, authorize('admin'), validate(staffSchema), createStaff);

// Task Management
router.post('/tasks', authMiddleware, authorize('admin'), validate(taskSchema), createTask);
router.put('/tasks/:id', authMiddleware, authorize('admin'), updateTask);
router.delete('/tasks/:id', authMiddleware, authorize('admin'), deleteTask);

module.exports = router;
