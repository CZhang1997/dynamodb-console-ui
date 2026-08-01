# DynamoDB Console UI

A standalone React/Electron interface for browsing DynamoDB tables and running
queries. DynamoDB request construction runs in the application and requests are
sent directly to AWS; no application backend is required.

## Run locally

```sh
npm install
npm start
```

To build the web application:

```sh
npm run build
```

To run the Electron application, configure an AWS shared credentials profile and
run:

```sh
npm run electron
```

## Credential safety

- Use temporary, least-privilege AWS credentials whenever possible.
- Web credentials are kept in memory for the current session and are not saved
  to IndexedDB or sent to an application backend.
- The Electron build reads the active local AWS shared credentials profile.
- Query history is stored locally and includes the access key ID, region, and
  query text, but not the secret access key or session token.

Never commit credentials, tokens, local environment files, build output, or
runtime logs.
