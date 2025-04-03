const express = require('express');
const router = express.Router();
const { dataStore } = require('../utils/store');

router.post('/', (req, res) => {
    const { site, section, rst, rid, rdt } = req.body;
    const minuteKey = new Date(rst).setSeconds(0, 0);
    if (!dataStore[minuteKey]) dataStore[minuteKey] = {};
    if (!dataStore[minuteKey][rid]) dataStore[minuteKey][rid] = [];
    dataStore[minuteKey][rid].push(rdt);
    res.json({ message: "Data received" });
});

module.exports = router;
