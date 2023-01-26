const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM companies');
        console.log(results);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const compResults = await db.query(`SELECT * FROM companies WHERE code=$1`, [code])
        const invResults = await db.query('SELECT * FROM invoices WHERE comp_code=$1', [code])
        if (compResults.rows.length === 0) {
            throw new ExpressError(`Can't find company with code ${code}`, 404);
        }
        const company = compResults.rows[0];
        company.invoices = invResults.rows
        return res.json(company);
    } catch (e) {
        next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description]);
        return res.status(201).send({ company: results.rows[0] });
    } catch (e) {
        next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *', [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code ${code}`, 404);
        }
        return res.send({ company: results.rows[0] });
    } catch (e) {
        next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code ${code}`, 404);
        }
        const result = await db.query('DELETE FROM companies WHERE code=$1', [code]);
        return res.send({ status: "deleted" });
    } catch (e) {
        next(e);
    }
})

module.exports = router;