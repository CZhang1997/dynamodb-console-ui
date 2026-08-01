import { toast } from "react-toastify";
import buildQuery from "./buildQuery";

const AWS = require("aws-sdk");

AWS.config.update({ dynamoDbCrc32: false });
const DYNAMODB_OPERATIONS = {
  SCAN: "SCAN",
  QUERY: "QUERY",
  GET: "GET",
};

function getInputsFromQuery(query) {
  const regex = /^select (.*?) from (.*?)\s*(?:where\s*(.*))?$/i;
  const match = query.match(regex);

  if (match) {
    const fieldsToGet = match[1].split(","); // Contains the fields selected (field1, field2)
    const targetTable = match[2]; // Contains the table name or source
    const whereString = match[3]; // Contains the optional 'where' condition
    const conditions = [];

    if (whereString) {
      const conditionRegex =
        /\s*([^=><]+)\s*([=><]+)\s*('[^']*'|"[^"]*"|[^'"\s]+)/gi;
      let conditionMatch;

      while ((conditionMatch = conditionRegex.exec(whereString)) !== null) {
        const [, filteredAtt, condition, filteredVal] = conditionMatch;
        conditions.push({
          filteredAtt: filteredAtt.replace(/and/gi, "").trim(),
          filteredVal: filteredVal.replace(/['"]/g, "").trim(),
          condition,
        });
      }
    }

    return { fieldsToGet, targetTable, conditions };
  }
  return {};
}

export default class DynamoDBAccessor {
  constructor(regionName, creds) {
    this.regionName = regionName;
    this.dynamodbClient = new AWS.DynamoDB({
      region: this.regionName,
      credentials: creds,
    });
    this.dynamodbDocumentClient = new AWS.DynamoDB.DocumentClient({
      region: this.regionName,
      credentials: creds,
    });
    this.tableList = [];
  }

  async describeTable(tableName) {
    try {
      const response = await this.dynamodbClient
        .describeTable({ TableName: tableName })
        .promise();
      const tableDetails = {
        tableName: response.Table.TableName,
        pk: response.Table.KeySchema[0].AttributeName,
      };
      if (response.Table.KeySchema.length > 1) {
        tableDetails.sk = response.Table.KeySchema[1].AttributeName;
      }
      if (response.Table.GlobalSecondaryIndexes) {
        tableDetails.gsi = [];
        for (const index of response.Table.GlobalSecondaryIndexes) {
          const gsiDetails = {
            indexName: index.IndexName,
            pk: index.KeySchema[0].AttributeName,
          };
          if (index.KeySchema.length > 1) {
            gsiDetails.sk = index.KeySchema[1].AttributeName;
          }
          tableDetails.gsi.push(gsiDetails);
        }
      }
      return tableDetails;
    } catch (error) {
      console.error(`Error describing table '${tableName}': ${error}`);
      return null;
    }
  }

  async listTables() {
    if (this.isLoading) {
      return [];
    }

    this.isLoading = true;
    this.tableNames = [];
    try {
      var LastEvaluatedTableName = null;
      do {
        const response = await this.dynamodbClient
          .listTables({
            ExclusiveStartTableName: LastEvaluatedTableName
              ? LastEvaluatedTableName
              : undefined,
          })
          .promise();
        LastEvaluatedTableName = response.LastEvaluatedTableName;
        this.tableNames = [...this.tableNames, ...response.TableNames];
      } while (LastEvaluatedTableName);
    } catch (error) {
      console.error("Error listing tables:", error);
    }
    console.log(`Received a total of ${this.tableNames.length} tables`);
    this.isLoading = false;
  }
  async describeAllTables() {
    const tableList = [];
    for (const tableName of this.tableNames) {
      const tableDetails = await this.describeTable(tableName);
      if (tableDetails) {
        tableList.push(tableDetails);
      }
    }
    this.tableList = tableList;
    return tableList;
  }

  getTables() {
    return this.tableList;
  }

  async executeQuery({ query, loadAllRecords, callback }) {
    query = query.trim();
    this.lastOperation = undefined;
    const { targetTable: tableName } = getInputsFromQuery(query);

    var selectedTable = this.tableList.find((table) =>
      table.tableName.toLowerCase().includes(tableName.toLowerCase())
    );

    if (!selectedTable) {
      const targetTable = this.tableNames.find((nam) =>
        nam.toLowerCase().includes(tableName.toLowerCase())
      );
      if (targetTable) {
        selectedTable = await this.describeTable(targetTable);
        this.tableList = [...this.tableList, selectedTable];
      }
    }
    var ExclusiveStartKey = undefined;
    const dynamodbDocumentClient = this.dynamodbDocumentClient;
    var items = [];
    if (selectedTable) {
      let queryBuilder;
      try {
        queryBuilder = buildQuery({ query, tableDetails: selectedTable });
      } catch (err) {
        toast.error(
          "Error while generating query: " + (err.message || String(err))
        );
        return;
      }
      // console.log(queryBuilder);
      this.selectedTable = selectedTable;
      const { operation, payload } = queryBuilder;
      this.lastOperation = operation;

      if (operation === DYNAMODB_OPERATIONS.GET) {
        toast.info(`Getting item using Pk for ${selectedTable.tableName}`);
        console.log("Getting item from PK", payload);
        const response = await dynamodbDocumentClient.get(payload).promise();
        const item = response.Item;
        this.searchResults = item ? [item] : [];
        callback({ results: this.searchResults });
        return this.searchResults;
      } else if (operation === DYNAMODB_OPERATIONS.QUERY) {
        console.log("Querying item ", payload);
        toast.info(`Querying item for ${selectedTable.tableName}`);
        do {
          const params = {
            ...payload,
            ExclusiveStartKey,
          };
          const response = await dynamodbDocumentClient.query(params).promise();
          items = response.Items || [];
          this.searchResults = items;
          callback({
            results: this.searchResults,
            ScannedCount: response.ScannedCount,
          });
          ExclusiveStartKey = response.LastEvaluatedKey;
        } while (loadAllRecords && ExclusiveStartKey);
        return items;
      } else {
        toast.info(`Scanning item for ${selectedTable.tableName}`);
        do {
          console.log("Scanning db with ", payload);
          const params = {
            ...payload,
            ExclusiveStartKey,
          };
          const response = await dynamodbDocumentClient.scan(params).promise();
          items = response.Items || [];
          this.searchResults = items;
          callback({
            results: this.searchResults,
            ScannedCount: response.ScannedCount,
          });
          ExclusiveStartKey = response.LastEvaluatedKey;
        } while (loadAllRecords && ExclusiveStartKey);
      }
    } else {
      console.error("Table not found in this.tableList:", tableName);
    }

    return [];
  }

  async updateItem(newObj) {
    // Translate the logic for updating items in DynamoDB based on the provided newObj
    // Similar to executeQuery, this involves handling async operations and API calls to DynamoDB.
  }
}
