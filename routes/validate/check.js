/*
 * WebAuthn login example.
 *
 * This script implements the server-side part of the WebAuthn login functionality. Since this is a minimal example,
 * not much actually happens in this file. If you haven't already, you'll probably want to read
 * public/javascripts/script.js first, which contains the client-side part of this example.
 */

const express = require('express');
const router = express.Router();

// FIXME Consider using HTTPs when running productively
const http = require('http');

/*
 * POST request for challenge-response authentication.
 *
 * This endpoint handles both the request for a challenge and the response to the challenge. It acts as a proxy for
 * the /validate/check endpoint of the privacyIDEA server.
 */
// noinspection JSUnusedLocalSymbols
router.post('/', function (req, res, next) {
    console.log(`User ${req.body.user} is trying to authenticate.`);

    /**
     * The data from the client.
     *
     * This is the data the client has passed. If will be either a request for a challenge, or a response to
     * a challenge. We do not need to concern ourselves with which it is, since we will just pass this through to
     * privacyIDEA, which will handle it appropriately.
     */
    const postData = JSON.stringify(req.body);

    /**
     * The backend request to the privacyIDEA server.
     *
     * This is the request that is sent to privacyIDEA. It will contain the data provided by the client. The only
     * endpoint we need to talk to is /validate/check, which is a POST endpoint. Additionally we provide the host and
     * port of the privacyIDEA server, as set in the environment.
     *
     * Several headers need to be set, in order for the request to be handled correctly. We will provide the request
     * data as JSON, so the Content-Type needs to be `application-json`. This is also the format of the response we
     * expect. The Content-Length of the request is the length of the data from the client, that we have already
     * assembled above, and we will pass through the Origin specified by the Client unaltered.
     */
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
            /**
             * Response data.
             *
             * As the response may be chunked, this will not necessarily arrive all at once, so it is stored here.
             *
             * @type {string}
             */
            let str = '';

            // Callback fired upon data arrival. Any chunk of data received is appended to the data we already have.
            msg.on('data', (chunk) => str += chunk);

            // Callback fired when the request terminates. This will handle any errors and return to the client
            msg.on('end', () => {
                /**
                 * Response data from privacyIDEA.
                 *
                 * If the request succeeded, this will contain the parsed response from privacyIDEA.
                 *
                 * @type {object}
                 */
                const data = msg.complete && JSON.parse(str);

                // Check whether the user authenticated successfully. If the response contains a result object with
                // keys named `status` and `value`, and both of those are true, then the user is fully authorized.
                // Information about the user that has just authenticated will be contained in the details object.
                if (data && data.result && data.result.status && data.result.value) {
                    // FIXME Since this is just an example, we simply log, that a successful authentication has taken
                    //  place. In a productive application, you will want to create a session for the user,
                    //  augmenting your response with something like a session ID, or a token, that the client can then
                    //  use for onward access into your system. Remember to never handle authorization on the client.
                    console.log(`User ${data.detail.user.id} has authenticated successfully!`);
                }

                // Our response to the client will again be JSON.
                res.set('Content-Type', 'application/json');

                // If we have a valid response from privacyIDEA, we will pass on the HTTP status code otherwise the
                // return code will be 502 BAD GATAWAY.
                res.status(data ? msg.statusCode : 502);

                // For this example that response is simply the data received from privacyIDEA. In a real application
                // you will usually want to return additional information, such as a session (see above).
                res.send(data || 'Bad Gateway');
            });
        });

    // Send the data to privacyIDEA.
    clientRequest.write(postData);
    clientRequest.end();
});

module.exports = router;
