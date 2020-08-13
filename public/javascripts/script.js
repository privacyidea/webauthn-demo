/*
 * WebAuthn login example.
 *
 * This script implements the client-side WebAuthn login functionality.
 */

(function() {
    "use strict";

    // TODO
})();

window.onload = function () {
    "use strict";

    const error = (err, msg) => {
        const main = document.getElementsByTagName('main')[0]
        const h2 = document.createElement('h2');
        const pre = document.createElement('pre');
        h2.textContent = "Error: " + err;
        pre.textContent = msg;
        main.appendChild(h2);
        main.appendChild(pre);
    }

    // Check if webauthn-client is loaded.
    try {
        pi_webauthn
    }
    catch (err) {
        error("Missing webauthn-client", err);
        return;
    }

    // Check if WebAuthn is supported.
    if (!pi_webauthn) {
        error(
            "WebAuthn unavailable.",
            "Cannot access navigator.credentials. Make sure WebAuthn is supported and HTTPs is used.");
        return;
    }
};
