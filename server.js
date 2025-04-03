const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const axios = require('axios');
// const events = require('events'); // Instead of require('node:events')
const { fetchCancode, sendDataStore } = require('./utils/tasks');

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/data', require('./routes/data'));
app.use('/aggregate', require('./routes/aggregate'));

// Root route
app.get('/', (req, res) => {
    res.json({ Hello: "World" });
});

app.get('/items/:item_id', (req, res) => {
    const { item_id } = req.params;
    const { q } = req.query;
    res.json({ item_id, q });
});

// Fetch cancode on startup
fetchCancode();

// Schedule periodic task
schedule.scheduleJob('*/30 * * * * *', sendDataStore);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
