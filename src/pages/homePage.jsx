import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import AutoPlayVideo from "../widget/autoPlayVideo";

const STEP_TO_GENERATE_CRED = [
  "Login to your AWS console",
  "Go to I AM -> User page",
  "Create a new user",
  "Enter username (like dynamodb access)",
  "Go to next and attach policy directly",
  "Select and add DynamoDB related permission, FullPermission/ReadOnly/Write.",
  "Click on Next and create user",
  "Go back to I AM role page and select the new user that has been created",
  "Find where said 'Access key 1' - and click on Create access key",
  "Select Command Line Interface (CLI)",
  "Select I understand the above recommendation and want to proceed to create an access key.",
  "Click on next and Create Access Key",
  "Save Access key and Secret access key some where so you can enter to on the consoles page",
];

function HomePage() {
  return (
    <Container>
      <header>
        <h1>DynamoDB Consoles</h1>
      </header>

      <section>
        <h2>About</h2>
        <p>
          My DynamoDB Console is an application that allows users to query their
          DynamoDB tables using SQL-like queries after entering their AWS
          credentials.
        </p>
        <div>
          {" "}
          <AutoPlayVideo videoSource={"/console_demo.mp4"} />
        </div>
        <p>
          <a href="/consoles">Try it now!</a>
        </p>
      </section>

      {/* Generating AWS Credentials Section */}
      <section>
        <h2>Generating AWS Credentials</h2>
        <p>
          Here's a guide on generating AWS credentials to use with the
          application:
          <ul>
            {STEP_TO_GENERATE_CRED.map((step) => {
              return <li key={step}>{step}</li>;
            })}
          </ul>
        </p>
      </section>

      {/* Supported Queries Section */}
      <section>
        <h2>Supported Queries</h2>
        <p>
          The application supports various SQL-like queries for querying
          DynamoDB tables. notes, string will be need to wrap with quote and
          number will just be number.
        </p>
        <h3>Supperted operations</h3>
        <ul>
          <li>
            Equal - Checks if a query can be performed using the partition key
            from the table/index.
          </li>
          <li>Greater Than</li>
          <li>Less Than</li>
        </ul>
      </section>
    </Container>
  );
}

export default HomePage;
