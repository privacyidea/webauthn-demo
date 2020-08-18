# webauthn-demo

Example project, showing how to authenticate against privacyIDEA using WebAuthn.

**Important: This is a demo. Many things are simplified. Please carefully review the comments labeled FIXME
implementing this yourself. DO NOT USE THIS CODE IN A PRODUCTION ENVIRONMENT!**

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
