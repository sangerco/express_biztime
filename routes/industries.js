const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require('slugify');
const { route } = require('./companies');

const options = {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: false,
    locale: 'en',
    trim: true,
  }

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM industries');
        console.log(results);
        return res.json({ industries: results.rows });
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { industry } = req.body;
        const code = slugify(industry, options);
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]);
        return res.status(201).send({ industry: results.rows[0] });
    } catch (e) {
        return next(e);
    }
})

module.exports = router;