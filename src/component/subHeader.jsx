import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Select from "react-select";
import iamUtil from "../accessor/iamUtil";
import { EditableModal, INPUT_TYPE } from "../widget/editableModal";
import { toast } from "react-toastify";
const awsRegions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "ap-south-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-northeast-3",
  "ap-southeast-1",
  "ap-southeast-2",
  "ca-central-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-north-1",
  "sa-east-1",
  "cn-north-1", // China (Beijing)
  "cn-northwest-1", // China (Ningxia)
  "me-south-1", // Middle East (Bahrain)
];

const region_options = awsRegions.map((region) => ({
  label: region,
  value: region,
}));
const AWS_LOGIN_CONFIG = [
  {
    fieldName: "accessKeyId",
    label: "Access key ID",
    inputType: INPUT_TYPE.TEXT,
    required: false,
  },
  {
    fieldName: "secretAccessKey",
    label: "Secret access key",
    inputType: INPUT_TYPE.PASSWORD,
  },
  {
    fieldName: "sessionToken",
    label: "Session token (optional)",
    inputType: INPUT_TYPE.TEXT,
  },
  {
    fieldName: "credentialsString",
    label: "Or paste an AWS credentials block",
    inputType: INPUT_TYPE.TEXT_AREA,
    placeHolder: `
aws_access_key_id = AASAFASFsfasfsafKSDSAKH
aws_secret_access_key = asadasjfhasdasdqwlmsadkasndasJq`,
  },
];

export default function SubHeader(props) {
  const {
    region,
    setRegion,
    awsCred,
    awsCredList,
    setAwsCredList,
    setAwsCred,
  } = props;
  const [iamUserList, setIamUserList] = useState({});

  useEffect(() => {
    if (awsCredList && awsCredList.length > 0) {
      awsCredList.forEach((cred) => {
        iamUtil.getLoginCred({
          creds: cred,
          region,
          callback: ({ err, user }) => {
            if (err) {
              toast.error("Unable to load credential for " + cred.accessKeyId);
              return;
            }
            setIamUserList((prev) => ({ ...prev, [cred.accessKeyId]: user }));
          },
        });
      });
    }
  }, [awsCredList]);
  const iamUserOptions = Object.keys(iamUserList).map((accessKeyId) => {
    return {
      label: iamUserList[accessKeyId].Arn,
      value: awsCredList.find((item) => item.accessKeyId === accessKeyId),
    };
  });

  var currentUser = null;

  if (awsCred && iamUserList[awsCred.accessKeyId]) {
    currentUser = {
      label: iamUserList[awsCred.accessKeyId].Arn,
      value: awsCredList.find(
        (item) => item.accessKeyId === awsCred.accessKeyId
      ),
    };
  }
  return (
    <header className="connection-bar">
      <Navbar>
        <Container fluid>
          <div className="connection-controls">
            <div className="connection-field">
              <span>Region</span>
              <Select
                className="connection-select region-select"
                classNamePrefix="connection-select"
                options={region_options}
                onChange={(val) => setRegion(val.value)}
                value={region_options.find((item) => item.value === region)}
              />
            </div>
            {currentUser === null ? (
              <span className="connection-status">
                {awsCred ? "Checking account…" : "Not connected"}
              </span>
            ) : (
              <div className="connection-field account-field">
                <span>Account</span>
                <Select
                  className="connection-select"
                  classNamePrefix="connection-select"
                  options={iamUserOptions}
                  onChange={(val) => {
                    setAwsCred(val.value);
                  }}
                  value={currentUser}
                />
              </div>
            )}
          </div>
          <div className="credential-action">
            <EditableModal
              title={"Add credentials"}
              currentValue={{}}
              configs={AWS_LOGIN_CONFIG}
              actionLabel={"Connect"}
              actionOnClick={(data) => {
                const {
                  credentialsString,
                  secretAccessKey,
                  accessKeyId,
                  sessionToken,
                } = data;
                if (secretAccessKey && accessKeyId && accessKeyId.length > 0) {
                  const newCred = {
                    secretAccessKey,
                    accessKeyId,
                    sessionToken,
                  };
                  setAwsCredList((prev) => [...prev, newCred]);
                } else if (credentialsString) {
                  const lines = credentialsString.split("\n"); // Split the string by lines
                  let accessKeyIdFromStr = "";
                  let secretAccessKeyFromStr = "";
                  let sessionTokenFromStr = null;
                  lines.forEach((line) => {
                    const [key, value] = line.split("=");
                    if (key.trim() === "aws_access_key_id") {
                      accessKeyIdFromStr = value.trim();
                    } else if (key.trim() === "aws_secret_access_key") {
                      secretAccessKeyFromStr = value.trim();
                    } else if (key.trim() === "aws_session_token") {
                      sessionTokenFromStr = value.trim();
                    }
                  });
                  if (accessKeyIdFromStr && secretAccessKeyFromStr) {
                    const newCred = {
                      secretAccessKey: secretAccessKeyFromStr,
                      accessKeyId: accessKeyIdFromStr,
                      sessionToken:
                        sessionTokenFromStr === null
                          ? undefined
                          : sessionTokenFromStr,
                    };
                    setAwsCredList((prev) => [...prev, newCred]);
                  }
                }
              }}
            />
          </div>
        </Container>
      </Navbar>
    </header>
  );
}
