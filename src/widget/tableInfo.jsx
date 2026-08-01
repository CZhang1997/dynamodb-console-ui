import React, { useState } from "react";
import { Button, Collapse } from "react-bootstrap";

import CustomTable from "./customTable";
import TableDetailsModal from "./TableDetailsModal";

const TablesInformation = ({ onQuickQuery, dbAccessor }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const [dynamoTables, setDynamoTables] = useState([]);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [displayingData, setDisplayData] = useState({});
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "10px 0",
        }}
      >
        <Button
          onClick={async () => {
            if (dbAccessor) {
              const tables = await dbAccessor.describeAllTables();
              setDynamoTables(tables);
              setIsCollapsed(false);
            }
          }}
        >
          Load All Tables Details
        </Button>
        <Button
          onClick={toggleCollapse}
          aria-controls="tablesCollapse"
          aria-expanded={isCollapsed}
        >
          {isCollapsed ? "Show" : "Hide"} Tables Info
        </Button>
      </div>
      <Collapse in={!isCollapsed}>
        <div id="tablesCollapse">
          <CustomTable
            title={"Table List"}
            data={dynamoTables}
            headers={["Table Name", "Primary Key", "Sort Key", "View", "Query"]}
            colCanSort={[true]}
            rows={dynamoTables.map((table) => {
              const res = [
                { value: table.tableName },
                { value: table.pk },
                { value: table.sk },
                {
                  value: "View details",
                  onClick: () => {
                    setDisplayData(table);
                    setShowJsonModal(true);
                  },
                },
                {
                  value: "Query",
                  onClick: () => {
                    onQuickQuery(
                      `select * from ${table.tableName} where ${table.pk}=''`
                    );
                  },
                },
              ];
              return res;
            })}
          />
        </div>
      </Collapse>
      <div>
        <TableDetailsModal
          show={showJsonModal}
          data={displayingData}
          onClose={() => setShowJsonModal(false)}
        />
      </div>
    </div>
  );
};

export default TablesInformation;
