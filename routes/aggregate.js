const express = require('express');
const router = express.Router();
const { dataStore } = require('../utils/store');

router.get('/', (req, res) => {
    const results = [];
    const sortedKeys = Object.keys(dataStore).sort();
    sortedKeys.forEach((minuteKey, index) => {
        const ridMap = dataStore[minuteKey];
        const rowObj = {
            row_id: index + 1,
            timestamp: new Date(parseInt(minuteKey)).toISOString(),
        };
        for (const rid in ridMap) {
            const values = ridMap[rid];
            const totalSum = values.reduce((a, b) => a + b, 0);
            const count = values.length;
            rowObj[`sum_${rid}`] = totalSum;
            rowObj[`avg_${rid}`] = count ? totalSum / count : 0;
        }
        results.push(rowObj);
    });
    res.json(results);
});

module.exports = router;
