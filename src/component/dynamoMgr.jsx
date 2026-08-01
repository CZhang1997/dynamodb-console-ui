import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

import DynamoDBAccessor from "../accessor/dynamoDBAccessor";
import AppContext from "../context/app-context";
import localData from "../localDB/localData";
import CustomTable from "../widget/customTable";
import JSONModal from "../widget/jsonModal";
import SearchWidget from "../widget/searchWidget";
import TableDetailsModal from "../widget/TableDetailsModal";

function createQueryTemplate(table) {
  return `select * from ${table.tableName}`;
}

export default function DynamoMgr({ awsCred = null, region }) {
  const [dbAccessor, setDBAccessor] = useState(null);
  const [tableNames, setTableNames] = useState([]);
  const [tableFilter, setTableFilter] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [loadingTable, setLoadingTable] = useState("");
  const [showSchema, setShowSchema] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [displayingData, setDisplayData] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [queryHistories, setQueryHistories] = useState([]);
  const [quickQuery, setQuickQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [querySummary, setQuerySummary] = useState(null);

  const { setLoading } = useContext(AppContext);

  useEffect(() => {
    async function loadWorkspace() {
      setLoading(true);
      setSelectedTable(null);
      setSearchResults([]);
      setQuerySummary(null);

      try {
        const accessor = new DynamoDBAccessor(region, awsCred);
        setDBAccessor(accessor);
        await accessor.listTables();
        setTableNames(accessor.tableNames || []);
        const history = await localData.getQueryHistoryFromKey({
          accessKeyId: awsCred.accessKeyId,
          region,
        });
        setQueryHistories(history);
      } catch (error) {
        toast.error(`Unable to load DynamoDB tables: ${error.message || error}`);
      } finally {
        setLoading(false);
      }
    }

    if (awsCred) {
      loadWorkspace();
    }
  }, [awsCred, region, setLoading]);

  async function selectTable(tableName) {
    if (!dbAccessor || loadingTable) {
      return;
    }

    setLoadingTable(tableName);
    try {
      let table = dbAccessor
        .getTables()
        .find((item) => item.tableName === tableName);
      if (!table) {
        table = await dbAccessor.describeTable(tableName);
        if (table) {
          dbAccessor.tableList = [...dbAccessor.tableList, table];
        }
      }
      if (!table) {
        throw new Error("Table details were not returned by AWS.");
      }
      setSelectedTable(table);
      setQuickQuery(createQueryTemplate(table));
    } catch (error) {
      toast.error(`Unable to load ${tableName}: ${error.message || error}`);
    } finally {
      setLoadingTable("");
    }
  }

  async function onSearch(query, loadAllRecords) {
    if (!dbAccessor || !query) {
      return;
    }

    if (
      loadAllRecords &&
      !window.confirm(
        "Load every result page? This can make many DynamoDB requests for a large table."
      )
    ) {
      return;
    }

    const startedAt = performance.now();
    try {
      setSearchResults([]);
      setSearching(true);
      let totalScanned = 0;
      let receivedResults = false;

      await dbAccessor.executeQuery({
        query,
        loadAllRecords,
        callback: ({ results = [], err, ScannedCount = 0 }) => {
          if (err) {
            throw err;
          }
          receivedResults = true;
          totalScanned += ScannedCount;
          setSearchResults((previous) => [...previous, ...results]);
        },
      });

      if (!receivedResults && !dbAccessor.lastOperation) {
        return;
      }

      const elapsedMs = Math.round(performance.now() - startedAt);
      setQuerySummary({
        operation: dbAccessor.lastOperation || "Request",
        elapsedMs,
        scannedCount: totalScanned,
      });

      if (receivedResults || dbAccessor.lastOperation) {
        setQueryHistories((previous) => [
          { query, insertedDate: new Date() },
          ...previous.filter((item) => item.query.trim() !== query.trim()),
        ]);
        localData.putItemToQueryHistory({
          accessKeyId: awsCred.accessKeyId,
          region,
          query,
        });
      }
    } catch (error) {
      toast.error(`Unable to run query: ${error.message || error}`);
    } finally {
      setSearching(false);
    }
  }

  const visibleTableNames = useMemo(
    () =>
      tableNames.filter((name) =>
        name.toLowerCase().includes(tableFilter.trim().toLowerCase())
      ),
    [tableNames, tableFilter]
  );

  const resultHeaders = useMemo(() => {
    const headers = new Set();
    searchResults.forEach((item) => {
      Object.keys(item).forEach((key) => headers.add(key));
    });
    if (selectedTable?.pk) {
      headers.delete(selectedTable.pk);
      return [selectedTable.pk, ...headers];
    }
    return [...headers];
  }, [searchResults, selectedTable]);

  const resultRows = searchResults.map((item) => [
    {
      value: "View JSON",
      actionLabel: true,
      onClick: () => {
        setShowJsonModal(true);
        setDisplayData(item);
      },
    },
    ...resultHeaders.map((key) => {
      const rawValue = item[key];
      const stringValue =
        rawValue && typeof rawValue === "object"
          ? JSON.stringify(rawValue)
          : rawValue === undefined || rawValue === null
          ? ""
          : String(rawValue);
      return {
        value: stringValue.substring(0, 80),
        title: stringValue,
        onClick: stringValue
          ? () => {
              navigator.clipboard
                .writeText(stringValue)
                .then(() => toast.info("Value copied"))
                .catch(() => toast.error("Could not copy this value"));
            }
          : undefined,
      };
    }),
  ]);

  return (
    <div className="dynamo-workspace">
      <aside className="table-sidebar">
        <div className="sidebar-heading">
          <h2>Tables</h2>
          <span>{tableNames.length}</span>
        </div>
        <Form.Control
          type="search"
          value={tableFilter}
          onChange={(event) => setTableFilter(event.target.value)}
          placeholder="Find a table"
          aria-label="Find a table"
        />
        <div className="table-list">
          {visibleTableNames.map((tableName) => (
            <button
              type="button"
              key={tableName}
              className={
                selectedTable?.tableName === tableName ? "selected" : ""
              }
              onClick={() => selectTable(tableName)}
            >
              <span>{tableName}</span>
              {loadingTable === tableName && <span>Loading…</span>}
            </button>
          ))}
          {visibleTableNames.length === 0 && (
            <p className="sidebar-empty">No matching tables.</p>
          )}
        </div>
        <div className="history-list">
          <h2>Recent queries</h2>
          <div className="history-items">
            {queryHistories.map(({ query }) => (
              <button
                type="button"
                key={query}
                onClick={() => setQuickQuery(query)}
                title={query}
              >
                {query}
              </button>
            ))}
          </div>
          {queryHistories.length === 0 && (
            <p className="sidebar-empty">Queries you run will appear here.</p>
          )}
        </div>
      </aside>

      <section className="workspace-main">
        {selectedTable && (
          <div className="selected-table-bar">
            <div>
              <strong>{selectedTable.tableName}</strong>
              <span>Partition key: {selectedTable.pk}</span>
              {selectedTable.sk && <span>Sort key: {selectedTable.sk}</span>}
            </div>
            <Button variant="outline-secondary" onClick={() => setShowSchema(true)}>
              View schema
            </Button>
          </div>
        )}

        <SearchWidget
          onSearch={onSearch}
          quickQuery={quickQuery}
          isLoading={searching}
          selectedTable={selectedTable}
        />

        <div className="results-section">
          <div className="results-heading">
            <div>
              <h2>Results</h2>
              {querySummary && (
                <p>
                  {searchResults.length} items · {querySummary.scannedCount} scanned
                  · {querySummary.operation.toLowerCase()} ·{" "}
                  {querySummary.elapsedMs} ms
                </p>
              )}
            </div>
          </div>
          {querySummary ? (
            <CustomTable
              headers={["Item", ...resultHeaders]}
              colCanSort={[false, ...resultHeaders.map(() => true)]}
              data={searchResults}
              rows={resultRows}
            />
          ) : (
            <div className="results-empty">
              <p>Run a query to inspect DynamoDB items.</p>
              <span>Selecting a table prepares a query using its partition key.</span>
            </div>
          )}
        </div>
      </section>

      <JSONModal
        show={showJsonModal}
        data={displayingData}
        onClose={() => setShowJsonModal(false)}
      />
      <TableDetailsModal
        show={showSchema}
        data={selectedTable || {}}
        onClose={() => setShowSchema(false)}
      />
    </div>
  );
}
