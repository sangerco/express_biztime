process.env.NODE_ENV = 'test';
const request = require('supertest');
const { resource } = require('../app');
const app = require('../app');
const db = require('../db');
const { createData } = require("../_test_common");

beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe('GET /invoices', () => {
    test('should return all invoices', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            "invoices": [
              {id: 1, comp_code: "apple"},
              {id: 2, comp_code: "apple"},
              {id: 3, comp_code: "ibm"},
            ]
          });
    }); 
})

describe('GET /invoices/:id', () => {
    test('should get a single invoices', async () => {
        const res = await request(app).get('/invoices/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: 1, 
                code: 'apple', 
                amt: 100, 
                paid: false, 
                add_date: '2018-01-01', 
                paid_date: null
            }
        })
    });
    test('should return 404 for invalid id', async () => {
        const res = await request(app).get('/invoices/654');
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: {
            message: "Can't find invoice with id 654",
            status: 404
            },
            message: "Can't find invoice with id 654"
        })
    });
})

describe('POST /invoices', () => {
    test('create an invoice', async () => {
        const res = await request(app).post('/invoices').send({ comp_code: 'apple', amt: 150, add_date: "2023-01-27T07:00:00.000Z" });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            "invoice": {
                "id": 4,
                "comp_code": "apple",
                "amt": 150,
                "paid": false,
                "add_date": "2023-01-27T07:00:00.000Z",
                "paid_date": null
            }
        })
    });
})

describe('PUT /invoices/:id', () => {
    test('update an invoice', async () => {
        const res = await (await request(app).put('/invoices/1')).send({ amt: 150 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: 1,
                comp_code: "apple",
                amt: 150,
                paid: false,
                add_date: "2018-01-01T07:00:00.000Z",
                paid_date: null
            }
        })
    });
    test('should return 404 for invalid id', async () => {
        const res = await request(app).put('/invoices/654').send({ amt: 150 });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: {
            message: "Can't find invoice with id 654",
            status: 404
            },
            message: "Can't find invoice with id 654"
        })
    });
})

describe('DELETE /invoices/:id', () => {
    test('delete single invoice', async () => {
        const res = await request(app).delete('/invoices/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            "status": "deleted"
        })
    });
    test('should return 404 for invalid id', async () => {
        const res = await request(app).delete('/invoices/654');
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            error: {
            message: "Can't find invoice with id 654",
            status: 404
            },
            message: "Can't find invoice with id 654"
        })
    });
})