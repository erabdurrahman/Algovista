const request = require('supertest')
const app = require('../src/app')

describe('AlgoVista API', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/api/health')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('validates empty code for explain endpoint', async () => {
    const response = await request(app).post('/api/explain').send({ code: '' })

    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('Code is required.')
  })
})
