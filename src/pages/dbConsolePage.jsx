import { useContext } from "react";
import DynamoMgr from "../component/dynamoMgr";
import AppContext from "../context/app-context";
import SubHeader from "../component/subHeader";

export default function DBConsolePage(props) {
  const {
    setRegion,
    region,
    awsCred,
    awsCredList,
    setAwsCredList,
    setAwsCred,
  } = useContext(AppContext);
  return (
    <div className="console-page">
      <SubHeader
        setRegion={setRegion}
        region={region}
        awsCred={awsCred}
        awsCredList={awsCredList}
        setAwsCredList={setAwsCredList}
        setAwsCred={setAwsCred}
      />
      {awsCred ? (
        <DynamoMgr awsCred={awsCred} region={region} />
      ) : (
        <section className="connection-empty-state">
          <div>
            <h1>Connect an AWS account</h1>
            <p>
              Add credentials to browse DynamoDB tables and run queries.
              Credentials stay in this application and are sent directly to
              AWS.
            </p>
          </div>
          <p className="connection-empty-hint">
            Use <strong>Add credentials</strong> above to continue.
          </p>
        </section>
      )}
    </div>
  );
}
