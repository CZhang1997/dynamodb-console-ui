import React from "react";
import { ListGroup } from "react-bootstrap";
import "./css/QueryHistories.css"; // Import your CSS file
import { getTimeSinceDate } from "../utils/helperFunctions";

const QueryHistories = ({ queryHistories = [], onClick }) => {
  if (!queryHistories || queryHistories.length === 0) {
    return null;
  }
  return (
    <div className="query-history">
      <h3 className="query-history-title">Query History</h3>
      <div className="clickable-list">
        <ListGroup className="scrollable-list">
          {queryHistories.map(({ query: str, insertedDate }, index) => (
            <ListGroup.Item
              onClick={() => onClick(str)}
              key={index}
              className="list-item d-flex justify-content-between align-items-center"
            >
              <span className="smaller-text">{str}</span>
              <span className="text-end">{getTimeSinceDate(insertedDate)}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default QueryHistories;
