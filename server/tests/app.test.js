process.env.JWT_SECRET = 'test_jwt_secret_123456789'

const request = require('supertest')
const app = require('../src/app')

describe('AlgoVista API', () => {
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'testpass123',
  }

  let authToken = ''

  it('returns health status', async () => {
    const response = await request(app).get('/api/health')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('registers user and returns token', async () => {
    const response = await request(app).post('/api/auth/register').send(testUser)

    expect(response.statusCode).toBe(201)
    expect(response.body.token).toBeTruthy()
    expect(response.body.user.email).toBe(testUser.email)

    authToken = response.body.token
  })

  it('logs user in', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    })

    expect(response.statusCode).toBe(200)
    expect(response.body.token).toBeTruthy()
    expect(response.body.user.email).toBe(testUser.email)
  })

  it('returns auth profile for valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'JWT ' + authToken)

    expect(response.statusCode).toBe(200)
    expect(response.body.user.email).toBe(testUser.email)
  })

  it('returns topics list', async () => {
    const response = await request(app).get('/api/learn/topics')

    expect(response.statusCode).toBe(200)
    expect(Array.isArray(response.body.topics)).toBe(true)
    expect(response.body.topics.length).toBeGreaterThan(0)
  })

  it('requires auth for progress', async () => {
    const response = await request(app).get('/api/learn/progress')

    expect(response.statusCode).toBe(401)
  })

  it('allows marking topic complete with auth', async () => {
    const topicsResponse = await request(app).get('/api/learn/topics')
    const firstTopicId = topicsResponse.body.topics[0].id

    const response = await request(app)
      .post(`/api/learn/progress/${firstTopicId}/complete`)
      .set('Authorization', 'JWT ' + authToken)

    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('Topic marked as completed.')
  })

  it('saves submission with auth', async () => {
    const topicsResponse = await request(app).get('/api/learn/topics')
    const firstTopicId = topicsResponse.body.topics[0].id

    const response = await request(app)
      .post('/api/learn/submissions')
      .set('Authorization', 'JWT ' + authToken)
      .send({
        topicId: firstTopicId,
        code: 'function sum(a,b){return a+b}',
        language: 'JavaScript',
        notes: 'practice',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.submission).toBeTruthy()
  })

  it('validates empty code for explain endpoint', async () => {
    const response = await request(app)
      .post('/api/explain')
      .set('Authorization', 'JWT ' + authToken)
      .send({ code: '' })

    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('Code is required.')
  })
})
