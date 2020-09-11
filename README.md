# webauthn-demo

Example project, showing how to authenticate against privacyIDEA using WebAuthn.

**Important: This is a demo. Many things are simplified. Please carefully review the comments labeled FIXME
before building implementation based on this yourself. DO NOT USE THIS CODE IN A PRODUCTION ENVIRONMENT!**

## Getting the code

To fetch this repository, simply run the following:

```
$ git clone --recursive https://github.com/privacyidea/privacyidea.git
```

**Important: Please note the `--recursive` flag used above. It is needed to fetch the `webauthn-client`, which resides
in a submodule. Without this option, the code will not work!**

If you checked out this repository a while ago, and want to get the newest changes from upstream, you can run:

```
$ git pull --recurse-submodules
```

## Configuration

You will have to configure this code with the hostname and port of your privacyIDEA installation, by either passing
the options in the environment, or putting them in a file named `.env`. See `example.env` for details.

## Running it

To run the server, simply type:

```
$ npm start
```

A webserver will come up on port `:3000` (unless configured otherwise), and allow you to test WebAuthn functionality in
privacyIDEA. Please make sure to connect using HTTPs, as a secure origin is required for WebAuthn to work. Self-signed
certificates are used for the purposes of this demo, so you will have to bypass a certificate security warning in your
browser.

## Using the example

Once you have enrolled yourself a WebAuthn-token in privacyIDEA, you can sign in with that token by simply entering the
name of the user the token has been enrolled for, along with the PIN for the token you want to sign with. If everything
works correctly, you will be asked to confirm the authentication with your token. Afterward, you will be rewarded
with a green success message, and some info about your logged in user, confirming the authentication succeeded. If
something goes wrong, an error message will appear telling you what happened.

## Diving into the code

The amount of files in this repository may seem daunting at first glance, so this section exists to give you an idea of
where to start reading. The most important part is the client-side implementation contained in
`public/javascripts/script.js`. It makes use of `window.pi_webauthn.sign()`, a function provided by `pi-webauthn.js`,
the privacyIDEA [webauthn-client](https://github.com/privacyidea/webauthn-client). Remember to load this file in your
own project before trying to use this function.

The server-side part of this project is written in node.js. However, since this is a minimal example, the job of the
server is really just to pass through the requests from the client on to the privacyIDEA server, so there is no need to
worry if you are not familiar with node.js. The code is very simple and will be easy to comprehend, even if you have
only used JavaScript on the client until now. You can simply ignore anything except `routes/validate/check.js`, which
handles the communication with the privacyIDEA-server. It is a small file and extensively commented, to make sure it is
possible to understand what is going on without even needing to look at the code at all.

## Getting help

If you feel lost, there is extensive documentation on using privacyIDEA with WebAuthn on
[ReadTheDocs](https://privacyidea.readthedocs.io). If you still need help, you can also ask around on the
[privacyIDEA community forums](https://community.privacyidea.org).
