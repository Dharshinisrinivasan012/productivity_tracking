import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Authentication', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should not register duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(400);
  });

  it('should login with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });
});

describe('Tasks', () => {
  let accessToken: string;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Task User',
      email: 'taskuser@example.com',
      password: 'password123',
    });
    accessToken = res.body.data.accessToken;
  });

  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Task', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Task');
  });

  it('should get tasks list', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Task 1' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});

describe('Habits', () => {
  let accessToken: string;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Habit User',
      email: 'habituser@example.com',
      password: 'password123',
    });
    accessToken = res.body.data.accessToken;
  });

  it('should create and track a habit', async () => {
    const createRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Exercise', color: '#10b981' });

    expect(createRes.status).toBe(201);

    const trackRes = await request(app)
      .post(`/api/habits/${createRes.body.data._id}/track`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ count: 1 });

    expect(trackRes.status).toBe(200);
    expect(trackRes.body.data.completions.length).toBe(1);
  });
});
