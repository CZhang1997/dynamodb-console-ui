import { Button, Form, Table } from "react-bootstrap";
import { useMemo, useState } from "react";
import { BsSortAlphaDownAlt, BsSortAlphaUpAlt } from "react-icons/bs";

import excelUtils from "../utils/excelUtils";
import { isValidNumber } from "./editableModal";

export default function CustomTable({
  headers = [],
  rows = [],
  colCanSort = [],
  data = [],
}) {
  const [sortByCol, setSortByCol] = useState(-1);
  const [sortByDir, setSortByDir] = useState(1);
  const [filter, setFilter] = useState("");

  const visibleRows = useMemo(() => {
    const matchingRows = rows.filter((row) =>
      row.some(({ value }) =>
        String(value).toLowerCase().includes(filter.trim().toLowerCase())
      )
    );

    if (!colCanSort[sortByCol]) {
      return matchingRows;
    }

    return [...matchingRows].sort((left, right) => {
      const leftValue = left[sortByCol]?.value ?? "";
      const rightValue = right[sortByCol]?.value ?? "";
      if (isValidNumber(leftValue) && isValidNumber(rightValue)) {
        return sortByDir * (Number(leftValue) - Number(rightValue));
      }
      return (
        sortByDir *
        String(leftValue).localeCompare(String(rightValue), undefined, {
          numeric: true,
        })
      );
    });
  }, [colCanSort, filter, rows, sortByCol, sortByDir]);

  return (
    <div className="results-table">
      <div className="results-toolbar">
        <Form.Control
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter loaded results"
          aria-label="Filter loaded results"
        />
        <Button
          variant="outline-secondary"
          disabled={data.length === 0}
          onClick={() =>
            excelUtils.generateExcelSheet({
              fileName: "DynamoDB results",
              excelData: data,
            })
          }
        >
          Export Excel
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="results-empty compact">
          <p>No items matched this query.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <Table hover size="sm">
            <thead>
              <tr>
                {headers.map((header, index) => {
                  const isCurrentSort = index === sortByCol;
                  return (
                    <th key={`${header}-${index}`}>
                      <button
                        type="button"
                        disabled={!colCanSort[index]}
                        onClick={() => {
                          if (isCurrentSort) {
                            setSortByDir((direction) => direction * -1);
                          } else {
                            setSortByCol(index);
                            setSortByDir(1);
                          }
                        }}
                      >
                        {header}
                        {colCanSort[index] &&
                          isCurrentSort &&
                          (sortByDir === 1 ? (
                            <BsSortAlphaUpAlt />
                          ) : (
                            <BsSortAlphaDownAlt />
                          ))}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map(({ onClick, value = "", title, actionLabel }, colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`} title={title}>
                      {onClick ? (
                        <button
                          type="button"
                          className={actionLabel ? "table-action" : "cell-copy"}
                          onClick={onClick}
                        >
                          {value}
                        </button>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
