const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory store (replace with DB in production)
let tasks = [
  { id: uuidv4(), title: 'Set up Docker', description: 'Containerize the app', status: 'done', priority: 'high', createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Configure CI/CD', description: 'Add GitHub Actions workflow', status: 'in-progress', priority: 'high', createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Write unit tests', description: 'Achieve 70%+ coverage', status: 'todo', priority: 'medium', createdAt: new Date().toISOString() },
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /api/tasks
router.get('/', (req, res) => {
  const { status, priority } = req.query;
  let result = [...tasks];
  if (status) result = result.filter(t => t.status === status);
  if (priority) result = result.filter(t => t.priority === priority);
  res.json({ tasks: result, total: result.length });
});

// GET /api/tasks/:id
router.get('/:id',
  param('id').isUUID(),
  validate,
  (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  }
);

// POST /api/tasks
router.post('/',
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['todo', 'in-progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validate,
  (req, res) => {
    const task = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    res.status(201).json(task);
  }
);

// PATCH /api/tasks/:id
router.patch('/:id',
  param('id').isUUID(),
  body('title').optional().trim().notEmpty().isLength({ max: 100 }),
  body('status').optional().isIn(['todo', 'in-progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validate,
  (req, res) => {
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });
    tasks[idx] = { ...tasks[idx], ...req.body, id: tasks[idx].id, createdAt: tasks[idx].createdAt };
    res.json(tasks[idx]);
  }
);

// DELETE /api/tasks/:id
router.delete('/:id',
  param('id').isUUID(),
  validate,
  (req, res) => {
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });
    tasks.splice(idx, 1);
    res.json({ message: 'Task deleted' });
  }
);

// Export tasks array for testing
router.getTasks = () => tasks;
router.resetTasks = (t) => { tasks = t; };

module.exports = router;
