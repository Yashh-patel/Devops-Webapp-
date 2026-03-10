const request = require('supertest');
const app = require('../src/server');

describe('Health Check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Tasks API', () => {
  it('GET /api/tasks returns task list', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it('POST /api/tasks creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Task');
    expect(res.body.priority).toBe('high');
    expect(res.body.id).toBeDefined();
  });

  it('POST /api/tasks rejects empty title', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/tasks/:id updates a task', async () => {
    // Create first
    const created = await request(app).post('/api/tasks').send({ title: 'To Update' });
    const id = created.body.id;
    const res = await request(app).patch(`/api/tasks/${id}`).send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  it('DELETE /api/tasks/:id removes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'To Delete' });
    const id = created.body.id;
    const res = await request(app).delete(`/api/tasks/${id}`);
    expect(res.status).toBe(200);
    // Verify gone
    const check = await request(app).get(`/api/tasks/${id}`);
    expect(check.status).toBe(404);
  });

  it('GET /api/tasks filters by status', async () => {
    const res = await request(app).get('/api/tasks?status=todo');
    expect(res.status).toBe(200);
    res.body.tasks.forEach(t => expect(t.status).toBe('todo'));
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });
});
