const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const { route } = require('./companies');
const now = new Date()

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM invoices');
        console.log(results);
        return res.json({ invoices: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id ${id}`, 404);
        }
        return res.json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
        return res.status(201).send({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        let paid_date;
        if (paid === false) {
            paid_date = null
            const results = await db.query(
                'UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *', [amt, paid, paid_date, id]);
            if (results.rows.length === 0) {
                throw new ExpressError(`Can't find invoice with id ${id}`, 404);
            }
            console.log(results.rows[0]);      
            return res.send({ invoice: results.rows[0] });
        } else if (!paid){
            const results = await db.query(
                'UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *', [amt, id]);
            if (results.rows.length === 0) {
                throw new ExpressError(`Can't find invoice with id ${id}`, 404);
            }
            console.log(results.rows[0]);      
            return res.send({ invoice: results.rows[0] });
        } else {
            paid_date = now;
            const results = await db.query(
                'UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *', [amt, paid, paid_date, id]);
            if (results.rows.length === 0) {
                throw new ExpressError(`Can't find invoice with id ${id}`, 404);
            }
            console.log(results.rows[0]);      
            return res.send({ invoice: results.rows[0] });
        }
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id ${id}`, 404);
        }
        const result = await db.query('DELETE FROM invoices WHERE id=$1', [id]);
        return res.send({ status: "deleted" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;