# DynamoDB Console UI

A standalone React/Electron interface for browsing DynamoDB tables and running
focused, SQL-like queries. Query construction runs locally and DynamoDB requests
go directly from the application to AWS. There is no project-owned API or
application backend.

## What it does

- Lists and filters DynamoDB tables in an AWS region.
- Reads table and global-secondary-index key schemas.
- Chooses `GetItem`, `Query`, or `Scan` from the table schema and query.
- Displays request type, scanned count, result count, and elapsed time.
- Loads additional result pages only after confirmation.
- Stores recent query text locally, capped at 100 unique queries per account and
  region.
- Exports results and provides full JSON inspection.

The application is currently read-only. It does not create, update, or delete
DynamoDB items.

## Query syntax

The editor accepts a deliberately small SQL-like syntax. It is not PartiQL.

```sql
SELECT * FROM Orders
SELECT * FROM Orders WHERE orderId = 'A-1001'
SELECT orderId, status FROM Orders WHERE customerId = 'C-42' AND createdAt > '2026-01-01'
```

Supported comparison operators are `=`, `>`, and `<`. Join multiple conditions
with `AND`. Quote string values and leave numeric values unquoted. Each request
starts with a 10-item limit; the UI can optionally continue through subsequent
pages.

## Run locally

Requirements:

- Node.js 18 or newer
- npm
- Temporary or otherwise least-privilege AWS credentials

```sh
git clone git@github.com:CZhang1997/dynamodb-console-ui.git
cd dynamodb-console-ui
npm install
npm start
```

Open `http://localhost:3000`, select a region, and choose **Add credentials**.
Temporary credentials can include an AWS session token.

To create a production web build:

```sh
npm run build
```

The Electron entry point reads the active AWS shared-credentials profile:

```sh
npm run electron
```

## Minimum AWS permissions

Start with temporary credentials and restrict resources further for your
environment. The console uses these read operations:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["sts:GetCallerIdentity", "dynamodb:ListTables"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DescribeTable",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME/index/*"
      ]
    }
  ]
}
```

Replace `REGION`, `ACCOUNT_ID`, and `TABLE_NAME` before using the policy.

## Credential and privacy model

- Web credentials remain in memory for the current session. They are not saved
  to IndexedDB or sent to a project-owned backend.
- AWS credentials are sent directly to AWS endpoints by the AWS SDK.
- Query history is stored in browser IndexedDB and includes the access key ID,
  region, and query text. It never includes the secret access key or session
  token.
- The application contains no analytics or tracking script.
- Clearing the application cache removes locally stored table metadata and query
  history.

Do not use root-account credentials. Never commit credentials, tokens, local
environment files, build output, or runtime logs.

## Known limitations

- The query parser supports only the documented syntax and operators.
- The web build requires credentials that are usable from the browser.
- This project currently uses Create React App and AWS SDK for JavaScript v2;
  both should be modernized in a future maintenance pass.
- The Electron wrapper is intended for local use and has not undergone a formal
  security review.

## Development checks

```sh
npm run build
npm test -- --watchAll=false
```

## License

No open-source license has been selected yet. Add a `LICENSE` file before
inviting reuse or contributions.
