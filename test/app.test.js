const request = require('supertest');
const app = require('../app'); // Adjust path based on your project structure

describe('User Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('User registered successfully');
  });

  it('should login successfully', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
