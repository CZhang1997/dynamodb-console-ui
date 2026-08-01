import React, { useEffect, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";

const SearchWidget = ({
  onSearch,
  quickQuery,
  isLoading = false,
  selectedTable,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [loadAll, setLoadAll] = useState(false);
  const searchInputRef = useRef(null);
  const handleSearch = () => {
    if (!isLoading) onSearch(searchValue.trim(), loadAll);
  };

  useEffect(() => {
    if (quickQuery) {
      setSearchValue(quickQuery);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [quickQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Form className="query-editor">
      <div className="query-editor-heading">
        <div>
          <h1>Query</h1>
          <p>
            {selectedTable
              ? `Writing a query for ${selectedTable.tableName}`
              : "Select a table or enter a SQL-like query"}
          </p>
        </div>
        <span className="query-shortcut">⌘ / Ctrl + Enter to run</span>
      </div>
      <Form.Group controlId="searchQuery">
        <Form.Label className="visually-hidden">Query</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="select * from userTable where age<=26 and name='Cath'"
          ref={searchInputRef}
        />
      </Form.Group>
      <div className="query-actions">
        <Form.Check // prettier-ignore
          className="load-all-control"
          type="switch"
          checked={loadAll}
          onChange={(e) => {
            setLoadAll(!loadAll);
          }}
          label="Load every page"
        />
        <div className="run-query-actions">
          {isLoading && <span>Running query…</span>}
          <Button
            disabled={isLoading || searchValue.trim().length === 0}
            variant="dark"
            onClick={handleSearch}
          >
            Run query
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default SearchWidget;
