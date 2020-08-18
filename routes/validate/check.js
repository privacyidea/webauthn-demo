const express = require('express');
const router = express.Router();
const http = require('http');

/* POST request for challenge-response authentication */
// noinspection JSUnusedLocalSymbols
router.post('/', function(req, res, next) {
    console.log(`User ${req.body.user} is trying to authenticate.`);

    const postData = JSON.stringify(req.body);
    const clientRequest = http.request(
        {
            method: 'POST',
            host: process.env.PI_HOST,
            port: process.env.PI_PORT,
            path: '/validate/check',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Origin': req.header('Origin')
            }
        },
        (msg) => {
            let str = '';
            msg.on('data', (chunk) => str += chunk);
            msg.on('end', () => {
                const data = msg.complete && JSON.parse(str);

                if (data && data.result && data.result.status && data.result.value) {
                    console.log(`User ${data.detail.user.id} has authenticated successfully!`);
                }

                res.set('Content-Type', 'application/json');
                res.status(data ? msg.statusCode : 502);
                res.send(data || 'Bad Gateway');
            });
        });
    clientRequest.write(postData);
    clientRequest.end();
});

module.exports = router;
