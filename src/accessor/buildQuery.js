const DYNAMODB_OPERATIONS = {
  SCAN: "SCAN",
  QUERY: "QUERY",
  GET: "GET",
};

function buildQueryExpression({
  equalConditionWithPk,
  skConditions,
  queryKey,
}) {
  let keyConditionExpression = "#pk = :val";
  const expressionAttributeNames = { "#pk": queryKey.pk };
  const expressionAttributeValues = {
    ":val": equalConditionWithPk.filteredVal,
  };

  skConditions.forEach(({ filteredAtt, condition, filteredVal }, index) => {
    keyConditionExpression += ` AND #sk${index} ${condition} :sk${index}`;
    expressionAttributeNames[`#sk${index}`] = filteredAtt;
    expressionAttributeValues[`:sk${index}`] = filteredVal;
  });

  return {
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    KeyConditionExpression: keyConditionExpression,
  };
}

function buildFilterExpression({
  conditions = [],
  ExpressionAttributeNames = {},
  ExpressionAttributeValues = {},
  ...request
}) {
  if (conditions.length === 0) {
    return {
      ...request,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    };
  }

  const filterParts = [];
  conditions.forEach(({ filteredAtt, condition, filteredVal }, index) => {
    filterParts.push(`#a${index} ${condition} :a${index}`);
    ExpressionAttributeNames[`#a${index}`] = filteredAtt;
    ExpressionAttributeValues[`:a${index}`] = filteredVal;
  });

  return {
    ...request,
    FilterExpression: filterParts.join(" AND "),
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
}

function getInputsFromQuery(query) {
  const match = query.match(/^select (.*?) from (.*?)\s*(?:where\s*(.*))?$/i);
  if (!match) {
    return {};
  }

  const fieldsToGet = match[1].split(",");
  const conditions = [];
  const whereString = match[3];

  if (whereString) {
    const conditionRegex =
      /\s*([^=><]+)\s*([=><]+)\s*('[^']*'|"[^"]*"|[^'"\s]+)/gi;
    let conditionMatch;

    while ((conditionMatch = conditionRegex.exec(whereString)) !== null) {
      const [, attribute, condition, rawValue] = conditionMatch;
      let value = rawValue;

      if (rawValue.includes("'") || rawValue.includes('"')) {
        value = rawValue.replace(/['"]/g, "");
      } else {
        const numericValue = Number.parseFloat(rawValue);
        value = Number.isNaN(numericValue) ? rawValue : numericValue;
      }

      conditions.push({
        filteredAtt: attribute.replace(/and/gi, "").trim(),
        filteredVal: value,
        condition,
      });
    }
  }

  return { fieldsToGet, conditions };
}

export default function buildQuery({ query = "", tableDetails = {} }) {
  const { tableName, pk: tablePk, sk: tableSk, gsi = [] } = tableDetails;
  if (!query || !tableName) {
    throw new Error(`query=${query} or tableName=${tableName} is empty.`);
  }

  const { fieldsToGet, conditions = [] } = getInputsFromQuery(query.trim());
  if (!fieldsToGet) {
    throw new Error("Invalid query. Expected: SELECT fields FROM table [WHERE ...]");
  }

  const ProjectionExpression =
    fieldsToGet[0].trim() === "*"
      ? undefined
      : fieldsToGet.map((attribute) => attribute.trim()).join(",");

  if (conditions.length === 0) {
    return {
      operation: DYNAMODB_OPERATIONS.SCAN,
      payload: { TableName: tableName, ProjectionExpression, Limit: 10 },
    };
  }

  const remainingConditions = [...conditions];
  let queryKey;
  const keyConditionIndex = remainingConditions.findIndex(
    ({ filteredAtt, condition }) => {
      if (condition !== "=") {
        return false;
      }
      if (filteredAtt.toLowerCase() === tablePk.toLowerCase()) {
        queryKey = { pk: tablePk, sk: tableSk };
        return true;
      }
      const matchingGsi = gsi.find(
        ({ pk }) => pk.toLowerCase() === filteredAtt.toLowerCase()
      );
      if (matchingGsi) {
        queryKey = { pk: matchingGsi.pk, sk: matchingGsi.sk };
        return true;
      }
      return false;
    }
  );

  const equalConditionWithPk =
    keyConditionIndex === -1
      ? undefined
      : remainingConditions.splice(keyConditionIndex, 1)[0];

  if (
    queryKey &&
    (equalConditionWithPk.filteredVal === "" ||
      equalConditionWithPk.filteredVal === undefined)
  ) {
    return {
      operation: DYNAMODB_OPERATIONS.SCAN,
      payload: {
        TableName: tableName,
        ...buildFilterExpression({ conditions: remainingConditions }),
        ProjectionExpression,
        Limit: 10,
      },
    };
  }

  if (!queryKey) {
    return {
      operation: DYNAMODB_OPERATIONS.SCAN,
      payload: {
        TableName: tableName,
        ...buildFilterExpression({ conditions: remainingConditions }),
        ProjectionExpression,
        Limit: 10,
      },
    };
  }

  if (queryKey.pk.toLowerCase() === tablePk.toLowerCase() && !tableSk) {
    return {
      operation: DYNAMODB_OPERATIONS.GET,
      payload: {
        TableName: tableName,
        Key: { [tablePk]: equalConditionWithPk.filteredVal },
        ProjectionExpression,
      },
    };
  }

  const skConditions = remainingConditions.filter(
    ({ filteredAtt }) =>
      queryKey.sk &&
      filteredAtt.toLowerCase() === queryKey.sk.toLowerCase()
  );
  const filterConditions = remainingConditions.filter(
    ({ filteredAtt }) =>
      !queryKey.sk ||
      filteredAtt.toLowerCase() !== queryKey.sk.toLowerCase()
  );
  const queryExpression = buildQueryExpression({
    equalConditionWithPk,
    skConditions,
    queryKey,
  });
  const matchingGsi = gsi.find(
    ({ pk }) => pk.toLowerCase() === queryKey.pk.toLowerCase()
  );

  return {
    operation: DYNAMODB_OPERATIONS.QUERY,
    payload: {
      TableName: tableName,
      ...(matchingGsi ? { IndexName: matchingGsi.indexName } : {}),
      ...buildFilterExpression({
        conditions: filterConditions,
        ...queryExpression,
      }),
      ProjectionExpression,
      Limit: 10,
    },
  };
}
