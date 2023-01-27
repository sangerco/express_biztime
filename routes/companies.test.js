process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { createData } = require("../_test_common");

beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe('GET /companies', () => {
    test('get a list with one company', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            "companies": [
              {code: "apple", description: "Maker of OSX.", name: "Apple"},
              {code: "ibm", description: "Big blue.", name: "IBM"},
            ]
          })
    })
})

describe('GET /companies/:code', () => {
    test('get a single company', async () => {
        const res = await request(app).get(`/companies/apple`);
        expect(res.statusCode).toBe(200);
    })
    test('responds with 404 for invalid code', async () => {
        const res = await request(app).get(`/company/xyz`);
        expect(res.statusCode).toBe(404);
    })
})

describe('POST /companies', () => {
    test('create a company', async () => {
        const res = await request(app).post('/companies').send({name: 'test company', description: 'test company'});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: expect.any(String), name: 'test company', description: 'test company'}
        });
    })
})

describe('PUT /companies/:code', () => {
    test('update a single company', async () => {
        const res = await request(app).put('/companies/apple').send({code: "apple", name: 'Google', description: "the Overlord", invoices: []});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            { company: {
                code: "apple",
                name: "Google",
                description: "the Overlord"
            }}
        )
    })
    test('responds with 404 for invalid code', async () => {
        const res = await request(app).get(`/company/xyz`).send({code: "xyz", name: 'blah blah', description: "blah blah blah", invoices: []});
        expect(res.statusCode).toBe(404);
    })
})

describe('DELETE /companies/:code', () => {
    test('delete a single company', async () => {
        const res = await request(app).delete('/companies/apple');
        expect(res.statusCode).toBe(200);        
        expect(res.body).toEqual(
            { status: "deleted" }
        )
    })
})