import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";

const generateExcelSheet = ({ excelData, fileName }) => {
  const fileType =
    "application/vnd.openxmI formats-officedocument. spreadsheetmI. sheet; charset-UTF-8";
  const fileExtension = ".xlsx";
  const exportToExcel = async () => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };
  exportToExcel();
};

export default { generateExcelSheet };
