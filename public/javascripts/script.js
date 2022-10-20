/*
 * WebAuthn login example.
 *
 * This script implements the client-side WebAuthn login functionality. If you are here to learn about how to make use
 * of WebAuthn in your application, you are in the right place.
 */

window.addEventListener('load', function () {
    "use strict";

    /**
     * The HTMLElement containing the app.
     *
     * This is used to tie the code to the frontend shown to the user, it is not directly related to WebAuthn in any
     * way. Your app will likely have a client-side framework, and the way you handle this will depend on the
     * framework used.
     *
     * @type {HTMLElement}
     */
    const main = document.getElementsByTagName('main')[0]

    /**
     * The HTMLElement containing the form the user enters their information into.
     *
     * This is used to tie the code to the frontend shown to the user, it is not directly related to WebAuthn in any
     * way. Your app will likely have a client-side framework, and the way you handle this will depend on the
     * framework used.
     *
     * @type {HTMLFormElement}
     */
    const form = document.getElementsByTagName('form')[0];

    /**
     * The HTMLElement the user enters their user name into.
     *
     * This is used to tie the code to the frontend shown to the user, it is not directly related to WebAuthn in any
     * way. Your app will likely have a client-side framework, and the way you handle this will depend on the
     * framework used.
     *
     * @type {HTMLElement}
     */
    const userInput = document.getElementById('user');

    /**
     * The HTMLElement the user enters their PIN into.
     *
     * This is used to tie the code to the frontend shown to the user, it is not directly related to WebAuthn in any
     * way. Your app will likely have a client-side framework, and the way you handle this will depend on the
     * framework used.
     *
     * @type {HTMLElement}
     */
    const passInput = document.getElementById('pass');

    /**
     * The button the user clicks to confirm their information.
     *
     * This is used to tie the code to the frontend shown to the user, it is not directly related to WebAuthn in any
     * way. Your app will likely have a client-side framework, and the way you handle this will depend on the
     * framework used.
     *
     * @type {HTMLElement}
     */
    const submitInput = document.getElementById('submit');

    /**
     * Handle a successful authentication.
     *
     * This will display a success message, confirming the authentication succeeded. In a real application, this
     * would usually redirect the user to some dashboard.
     *
     * @param detail The object from privacyIDEA containing information about the user.
     */
    const success = detail => {
        const div = document.createElement('div');
        const h2 = document.createElement('h2');
        const pre = document.createElement('pre');
        const p = document.createElement('p');
        const span = document.createElement('span');
        const a = document.createElement('a');

        div.classList.add('success');
        h2.textContent = `${detail.serial}: ${detail.message}`
        pre.textContent = JSON.stringify(detail.user, null, 8);
        span.textContent = "Authentication successful. You are now logged in. "
        a.href = '/';
        a.textContent = "Log out";

        p.appendChild(span);
        p.appendChild(a);
        div.appendChild(h2);
        div.appendChild(pre);
        div.appendChild(p);
        main.removeChild(form);
        main.appendChild(div);
    }

    /**
     * Handle a failed authentication.
     *
     * This will display an error, giving information about wat happened. In a real application you will likely want
     * to make an effort at gracefully recovering first.
     *
     * @param err The error to be displayed.
     */
    const error = err => {
        const div = document.createElement('div');
        const h2 = document.createElement('h2');
        const pre = document.createElement('pre');

        div.classList.add('error');
        h2.textContent = err;
        pre.textContent = err.stack;

        div.appendChild(h2);
        div.appendChild(pre);
        main.appendChild(div);

        submitInput.disabled = true;
    }

    /**
     * Remove the error being displayed.
     *
     * This is called when the user tried again after encountering an error, to remove the previous error message,
     * to keep error messages from piling up with repeated attempts.
     */
    const clearErrors = () => {
        for (const e of document.getElementsByClassName('error')) {
            e.parentElement.removeChild(e);
        }
    }

    /**
     * Lock the input form.
     *
     * This is called when the user had submitted the form. It will disable the button on the form, to prevent
     * repeated submissions, and display a little loading indicator to communicate to the user, that the app is
     * processing the request.
     */
    const lockForm = () => {
        submitInput.disabled = true;
        form.classList.add('processing');
    }

    /**
     * Unlock the input form.
     *
     * This is called after an authentication attempt has finished. It will enable the submit button again and hide
     * the loading indicator, giving the user an opportunity ot try again.
     */
    const unlockForm = () => {
        submitInput.disabled = false;
        form.classList.remove('processing');
    }

    /**
     * Send a request to the server.
     *
     * This is a wrapper used to make requests to the server. It is passed a body to be sent, and will return the
     * response it received. If any Error occurs, it will be thrown.
     *
     * @param {object} requestBody The object to be sent to the server.
     *
     * @returns {Promise<object>} The response from privacyIDEA.
     */
    const postValidateCheck = async requestBody => {
        // The only endpoint needed is /validate/check, it will be used to both request the challenge and return
        // the result. All data will be sent and received encoded as JSON.
        const httpResponse = await fetch('/validate/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // If a server-side error is encountered, we throw an error with the information from the Response.
        if (httpResponse.status >= 500) {
            throw new Error(`${httpResponse.status} ${httpResponse.statusText}`);
        }

        // Decode the data form the response. Even in case of an error, there will be more details here.
        const httpResponseData = await httpResponse.json();

        // The status key in the result object returned from privacyIDEA indicated whether the request was successful.
        // If the request was unsuccessful, we throw an error with the error-message provided by privacyIDEA.
        if (!httpResponseData.result.status) {
            throw new Error(httpResponseData.result.error.message);
        }

        // If the status indicates success, we return the information to be digested further.
        // FIXME In a production system, you should also check `httpResponseData.signature`.
        return httpResponseData;
    }

    /**
     * Authenticate to privacyIDEA.
     *
     * This is the function that does the heavy lifting. All the interesting bits are here.
     *
     * @returns {Promise<object>}
     */
    const authenticate = async () => {
        /**
         * The id of the user.
         *
         * Since the username entered in the form might contain a realm, we need to make sure to only include
         * the part before the at-sign, if the input contains an at-sign.
         *
         * @type {string}
         */
        const user = userInput.value.split('@')[0];

        /**
         * The realm of the user.
         *
         * The realm of the user is the part of the username that comes after the at-sign (if any).
         *
         * @type {string}
         */
        const realm = userInput.value.split('@')[1];

        /**
         * The PIN for the token the user wants to use.
         */
        const pass = passInput.value;

        /*
         * 1. Step: Request challenge
         *
         * The first step – as with any form of challenge-response authentication – is the request a challenge from the
         * server.
         */

        // A challenge is pulled from privacyIDEA simply by providing a user, realm and PIN to /validate/check. This
        // works the same regardless of token type.
        const challenge = await postValidateCheck({user, realm, pass});

        // If the challenge contains no attributes, the username or PIN were likely incorrect. There will be a message
        // providing more information. This works the same way for any challenge-response token.
        if (!challenge.detail.attributes) {
            // FIXME In practice you will of course want to handle this more gracefully.
            throw new Error(challenge.detail.message);
        }

        // For WebAuthn tokens, privacyIDEA will provide a WebAuthnSignRequest, containing all WebAuthn-specific
        // information needed to complete the authentication. If the response contains no WebAuthnSign request, make
        // sure the token you are trying to authenticate with is actually a WebAuthn-token.
        if (!challenge.detail.attributes.webAuthnSignRequest) {
            // FIXME For the purposes of this demo we only care about WebAuthn tokens, a real-world application would
            //  usually contain additional logic here, to handle various other types of token.
            throw new Error("The given PIN is either incorrect, or does not correspond to a WebAuthn token.");
        }

        /*
         * 2. Step: Sign challenge
         *
         * The second step is to generate a signature for the challenge. This is the step that involves the actual
         * token hardware. It is also the only step in this process that is fairly hard to get right. Thankfully
         * the privacyIDEA webauthn-client will handle all the difficult bits.
         */

        // privacyIDEA will provide a message to show to ask the user to use their token to authenticate. You could of
        // course also hard-code a message here, but using the message provided by privacyIDEA ensures consistency, and
        // will allow the administrator the configure the message in one central place for all services at once. This
        // feature is not WebAuthn-specific.
        // FIXME Do not use alert() in practice, as it will block execution.
        alert(challenge.detail.message);

        // In order to get a challenge signed, all we need to do is call pi_webauthn.sign() with the
        // WebAuthnSignRequest from privacyIDEA. This will cause a dialog to be shown to the user, asking them to
        // confirm with their token. And a WebAuthnSignResponse will be returned, containing the information necessary
        // to complete the authentication process in a format readily understood by privacyIDEA.
        // noinspection JSUnresolvedFunction
        const webAuthnSignResponse = await pi_webauthn.sign(challenge.detail.attributes.webAuthnSignRequest);

        /*
         * 3.Step: Send response
         *
         * Once the signing ceremony is completed, all that is left to do is to return the response.
         */

        // In order to complete the authentication process, we will make one more request to /validate/check, again
        // providing the user and the realm. This time, however, we will provide an empty string as the password, and
        // pass along all the information that was returned by pi_webauthn.sign().
        const authentication = await postValidateCheck({
            user,
            realm,
            pass: '',
            transaction_id: challenge.detail.transaction_id,
            credentialid: webAuthnSignResponse.credentialid,
            clientdata: webAuthnSignResponse.clientdata,
            signaturedata: webAuthnSignResponse.signaturedata,
            authenticatordata: webAuthnSignResponse.authenticatordata,
            userhandle: webAuthnSignResponse.userhandle,
            assertionclientextensions: webAuthnSignResponse.assertionclientextensions
        });

        // Interpreting the response again works the same way as with any other way of signing in to privacyIDEA.
        // There will be a result object, containing a value key, indicating whether the authentication attempt was
        // successful. If it wasn't, the detail object will have a message indicating what was wrong, otherwise it
        // will have information on the newly authenticated user. Here we simply check `result.value`, either returning
        // the user details of the newly logged in user, or throwing an appropriate Error.
        //
        // FIXME In a real application you will want to create some sort of session and include it in the response.
        //  Please refer to the server-side implementation in /routes/validate/check.js for details. Remember to never
        //  handle authorization on the client.
        if (!authentication.result.value) {
            throw new Error(authentication.detail.message);
        }
        return authentication.detail;
    }

    // Check if webauthn-client is loaded. If `window.pi_webauthn` is `undefined`, pi-webauthn.js was not loaded, in
    // this case we will display an error.
    try {
        // noinspection BadExpressionStatementJS
        pi_webauthn;
    } catch (err) {
        error(new Error("Missing webauthn-client"));
        return;
    }

    // Check if WebAuthn is supported. If `window.pi_webauthn` is `null`, WebAuthn is not supported in this context,
    // either because the web browser used does not support WebAuthn, or because the context is not deemed secure
    // (the latter usually occurs when attempting to load the site using plain HTTP). In this case we will also dispay
    // an error.
    if (!pi_webauthn) {
        error(new Error("WebAuthn unavailable."));
        return;
    }

    // Hook into form submission.
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Visually confirm to the user, that the authentication is being processed, and clear any previous error
        // messages that might still be showing.
        lockForm();
        clearErrors();

        // Authenticate to the server, calling success() with the result, if authentication succeeded (and the promise
        // resolved), and error() with the error that was thrown, if the authentication did not succeed (and the
        // promise was rejected). Finally call unlockForm(), to allow the user to make another attempt (unlockForm()
        // will be called independently of whether authentication succeeded, however as success() removes the form
        // from the DOM, it will only have a visible effect if authentication did not succeed).
        authenticate()
            .then(success)
            .catch(error)
            .then(unlockForm);
    });
});
