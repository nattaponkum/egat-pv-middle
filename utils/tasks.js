const axios = require('axios');
const { dataStore, cancodeMapping } = require('./store');

const backendURL = "http://egat-pv-backend.azurewebsites.net:8081"; // Uncomment for production
// const backendURL = "http://localhost:8081"; // Uncomment for local testing

// use format string for backend URL + endpoint
// const inverterEndpointUrl = `${backendURL}/pv`;

const inverterEndpointUrl = `${backendURL}/pv`;
const batteryEndpointUrl = `${backendURL}/battery`;
const canCodeEndpointUrl = `${backendURL}/cancode`;

async function fetchCancode() {
    try {
        const response = await axios.get(canCodeEndpointUrl);
        if (response.status === 200) {
            response.data.forEach(item => {
                cancodeMapping[item.id] = item;
            });
        }
    } catch (error) {
        console.error("Error fetching cancode:", error.message);
    }
}

async function sendDataStore() {
    try {
        results = [];
        for (const minuteKey in dataStore) {
            const ridMap = dataStore[minuteKey];
            rowObj = {
                timestamp: new Date(parseInt(minuteKey)).toISOString(),
                site: "1",
                section: "1",
            };
            for (const rid in ridMap) {
                const values = ridMap[rid];
                const totalSum = values.reduce((a, b) => a + b, 0);
                const count = values.length;
                const totalAvg = count ? totalSum / count : 0;
                const cancode = Object.values(cancodeMapping).find(item => item.can_code === rid);
                if (!cancode) {
                    console.log(`Can code ${rid} not found in cancode mapping`);
                    continue;
                }
                rowObj[cancode.dashboard_field] = totalAvg;
                rowObj.device_type = cancode.device_type;
            }
            results.push(rowObj);
        }

        const separatedResults = results.reduce((acc, result) => {
            const { device_type } = result;
            if (!acc[device_type]) acc[device_type] = [];
            acc[device_type].push(result);
            return acc;
        }, {});

        console.log('Separated Results:', separatedResults);

        for (const deviceType in separatedResults) {
            const deviceResults = separatedResults[deviceType];
            const flattenedResults = Object.assign({}, ...deviceResults);
            const endpoint = deviceType === 'inverter' ? inverterEndpointUrl : batteryEndpointUrl;
            console.log('Flattened Results:', flattenedResults);
            const response = await axios.post(endpoint, flattenedResults);
            console.log(`${deviceType} data sent successfully with status code ${response.status}`);
        }

        Object.keys(dataStore).forEach(key => delete dataStore[key]); // Clear data store
    } catch (error) {
        console.error("Error sending data store:", error.message);
    }
}

module.exports = { fetchCancode, sendDataStore };
