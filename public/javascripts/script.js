/*
 * WebAuthn login example.
 *
 * This script implements the client-side WebAuthn login functionality.
 */

window.addEventListener('load', function () {
    "use strict";

    const main = document.getElementsByTagName('main')[0]
    const form = document.getElementsByTagName('form')[0];
    const userInput = document.getElementById('user');
    const passInput = document.getElementById('pass');
    const submitInput = document.getElementById('submit');

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

    const clearErrors = () => {
        for (const e of document.getElementsByClassName('error')) {
            e.parentElement.removeChild(e);
        }
    }

    const lockForm = () => {
        submitInput.disabled = true;
        form.classList.add('processing');
    }

    const unlockForm = () => {
        submitInput.disabled = false;
        form.classList.remove('processing');
    }

    const postValidateCheck = async requestBody => {
        const httpResponse = await fetch('/validate/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (httpResponse.status >= 500) {
            throw new Error(`${httpResponse.status} ${httpResponse.statusText}`);
        }

        const httpResponseData = await httpResponse.json();
        if (!httpResponseData.result.status) {
            throw new Error(httpResponseData.result.error.message);
        }

        // FIXME In a production system, you should also check `httpResponseData.signature`.
        return httpResponseData;
    }

    const authenticate = async () => {
        const user = userInput.value.split('@')[0];
        const realm = userInput.value.split('@')[1];
        const pass = passInput.value;


        /*
         * 1. Step: Request challenge
         */

        const challenge = await postValidateCheck({user, realm, pass});

        if (!challenge.detail.attributes) {
            // FIXME In practice you will of course want to handle this more gracefully.
            throw new Error(challenge.detail.message);
        }

        if (!challenge.detail.attributes.webAuthnSignRequest) {
            // FIXME For the purposes of this demo we only care about WebAuthn tokens, a real-world application would
            //  usually contain additional logic here, to handle various other types of token.
            throw new Error("The given PIN is either incorrect, or does not correspond to a WebAuthn token.");
        }

        /*
         * 2. Step: Sign challenge
         */

        // FIXME Do not use alert() in practice, as it will block execution.
        alert(challenge.detail.message);

        // noinspection JSUnresolvedFunction
        const webAuthnSignResponse = await pi_webauthn.sign(challenge.detail.attributes.webAuthnSignRequest);

        /*
         * 3.Step: Send response
         */

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

        if (!authentication.result.value) {
            throw new Error(authentication.detail.message);
        }

        return authentication.detail;
    }

    // Check if webauthn-client is loaded.
    try {
        // noinspection BadExpressionStatementJS
        pi_webauthn;
    } catch (err) {
        error(new Error("Missing webauthn-client"));
        return;
    }

    // Check if WebAuthn is supported.
    if (!pi_webauthn) {
        error(new Error("WebAuthn unavailable."));
        return;
    }

    // Hook into form submission.
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        lockForm();
        clearErrors();

        authenticate()
            .then(success)
            .catch(error)
            .then(unlockForm);
    });
});
