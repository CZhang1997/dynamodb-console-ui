// db.js
import Dexie from "dexie";
import { generateRandomId } from "../utils/helperFunctions";

const metadataDB = new Dexie("AWSMetadataDB");

metadataDB.version(2).stores({
  tableInfoDB: "&id, account, region, tableName, pk, sk, gsi",
  credentialsDB: "&id, credentialString",
  queryHistory: "&id, accessKeyId, region, keyRegion, query, insertedDate",
});

// Credentials are session-only. Delete records created by older app versions.
metadataDB.version(3).stores({
  credentialsDB: null,
});

async function putItemToQueryHistory({ accessKeyId, region, query }) {
  const insertedDate = new Date().toISOString();
  const normalizedQuery = query.trim();
  const keyRegion = `${accessKeyId}##${region}`;
  const matchingRecords = await metadataDB.queryHistory
    .where("keyRegion")
    .equalsIgnoreCase(keyRegion)
    .filter((item) => item.query.trim() === normalizedQuery)
    .toArray();

  if (matchingRecords.length > 0) {
    const [recordToUpdate, ...duplicates] = matchingRecords;
    await metadataDB.queryHistory.update(recordToUpdate.id, {
      query: normalizedQuery,
      insertedDate,
    });
    if (duplicates.length > 0) {
      await metadataDB.queryHistory.bulkDelete(
        duplicates.map((item) => item.id)
      );
    }
    return recordToUpdate.id;
  }

  const id = generateRandomId();
  return metadataDB.queryHistory.put({
    id,
    insertedDate,
    accessKeyId,
    region,
    keyRegion,
    query: normalizedQuery,
  });
}

async function getQueryHistoryFromKey({ accessKeyId, region }) {
  const MAX_RECORDS = 100;

  const records = await metadataDB.queryHistory
    .where("keyRegion")
    .equalsIgnoreCase(`${accessKeyId}##${region}`)
    .toArray();
  const sortedRecords = records.sort(
      (a, b) =>
        new Date(b.insertedDate).getTime() - new Date(a.insertedDate).getTime()
    );
  const seenQueries = new Set();
  const duplicateIds = [];
  const uniqueRecords = sortedRecords
    .filter((item) => {
      const normalizedQuery = item.query.trim();
      if (seenQueries.has(normalizedQuery)) {
        duplicateIds.push(item.id);
        return false;
      }
      seenQueries.add(normalizedQuery);
      return true;
    })
    .map((item) => ({ ...item, insertedDate: new Date(item.insertedDate) }));

  const expiredIds = uniqueRecords.slice(MAX_RECORDS).map((item) => item.id);
  const idsToDelete = [...duplicateIds, ...expiredIds];
  if (idsToDelete.length > 0) {
    await metadataDB.queryHistory.bulkDelete(idsToDelete);
  }

  return uniqueRecords.slice(0, MAX_RECORDS);
}

async function deleteAllCaches() {
  // Delete the entire database
  metadataDB
    .delete()
    .then(() => {
      console.log("Database cleared");
    })
    .catch((error) => {
      console.error("Error clearing database:", error);
    });

  return 1;
}

export default {
  getQueryHistoryFromKey,
  putItemToQueryHistory,
  deleteAllCaches,
};
