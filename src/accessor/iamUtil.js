const AWS = require("aws-sdk");

async function getLoginCred({ creds, callback, region }) {
  const sts = new AWS.STS({ region, credentials: creds });
  try {
    const response = await sts.getCallerIdentity().promise();
    callback({ user: response });
    // Access response.Account, response.UserId, response.Arn, etc. for caller identity details
  } catch (err) {
    console.error("Error:", err);
    callback({ err });
  }
}

export default { getLoginCred };
