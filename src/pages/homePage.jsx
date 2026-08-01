import React from "react";
import { Link } from "react-router-dom";

const QUERY_EXAMPLES = [
  {
    label: "Scan a table",
    query: "SELECT * FROM Orders",
  },
  {
    label: "Get an item by partition key",
    query: "SELECT * FROM Orders WHERE orderId = 'A-1001'",
  },
  {
    label: "Query a partition and sort key",
    query:
      "SELECT orderId, status FROM Orders WHERE customerId = 'C-42' AND createdAt > '2026-01-01'",
  },
];

function HomePage() {
  return (
    <div className="home-page">
      <section className="home-intro">
        <div>
          <h1>DynamoDB Console UI</h1>
          <p>
            Browse tables and run focused DynamoDB requests with a compact,
            SQL-like query editor. The application talks directly to AWS and
            does not require an application backend.
          </p>
        </div>
        <Link className="home-primary-action" to="/consoles">
          Open console
        </Link>
      </section>

      <section className="home-section" aria-labelledby="getting-started">
        <h2 id="getting-started">Before you connect</h2>
        <ol className="home-steps">
          <li>
            <strong>Use limited credentials.</strong> Prefer temporary AWS
            credentials with only the DynamoDB and STS permissions you need.
          </li>
          <li>
            <strong>Select a region.</strong> The console lists tables for the
            active credential and region.
          </li>
          <li>
            <strong>Choose a table and run a query.</strong> Table metadata is
            used to select GetItem, Query, or Scan automatically.
          </li>
        </ol>
        <p className="home-security-note">
          Web credentials remain in memory for the current session. They are
          sent directly to AWS, never to a project-owned backend, and are not
          saved in IndexedDB.
        </p>
      </section>

      <section className="home-section" aria-labelledby="query-syntax">
        <h2 id="query-syntax">Supported query syntax</h2>
        <p>
          Use <code>SELECT</code>, an optional <code>WHERE</code> clause, and
          conditions joined with <code>AND</code>. Supported comparison
          operators are <code>=</code>, <code>&gt;</code>, and <code>&lt;</code>.
          Quote strings; leave numbers unquoted.
        </p>
        <div className="query-examples">
          {QUERY_EXAMPLES.map(({ label, query }) => (
            <div className="query-example" key={label}>
              <strong>{label}</strong>
              <code>{query}</code>
            </div>
          ))}
        </div>
        <p className="home-limit-note">
          This is a small query language, not PartiQL. Requests currently return
          up to 10 items per run.
        </p>
      </section>
    </div>
  );
}

export default HomePage;
