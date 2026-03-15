const express = require('express');
const router = express.Router();
const { getTasks, getProgress, completeTask, updateLongTermProgress, startMission } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');

const longTermSchema = {
    steps: { isNumeric: true },
    distance: { isNumeric: true }
};

const completeTaskSchema = {
    code: { required: true }
};

router.get('/', getTasks);
router.get('/progress', authMiddleware, getProgress);
router.post('/start/:taskId', authMiddleware, startMission);
router.post('/complete/:taskId', authMiddleware, validate(completeTaskSchema), completeTask);
router.patch('/long-term', authMiddleware, validate(longTermSchema), updateLongTermProgress);

module.exports = router;
