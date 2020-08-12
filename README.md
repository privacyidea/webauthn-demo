# webauthn-demo

**Note: This repository does not yet contain any implementation. Please stand
by, the contents of this repository will be updated shortly.**

Example project, showing how to authenticate against privacyIDEA using WebAuthn.

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

You will have to configure this code with the path to your privacyIDEA installation, as well as the necessary
credentials for your service account.

## Running it

To run the server, simply type:

```
$ npm start
```

A webserver will come up on port `:3000` (unless configured otherwise), and allow you to test WebAuthn functionality in
privacyIDEA.
