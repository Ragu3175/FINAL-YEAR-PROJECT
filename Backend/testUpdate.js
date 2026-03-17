// testUpdate.js
const http = require('http');

const postData = JSON.stringify({
    "latitude": 0.000000,
    "longitude": 0.000000,
    "speed": 0.00,
    "accelX": -2.34,
    "accelY": 0.45,
    "accelZ": 8.56,
    "gyroX": 0.05,
    "gyroY": -0.03,
    "gyroZ": 0.02,
    "irStatus": 0,
    "mqValue": 1408,
    "flexValue": 319,
    "weight": 0.03
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/vehicle/update',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-device-key': '20d2d1ad663fc7988210ab7f8ecbc663',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
