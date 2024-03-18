'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar";
import { decode } from 'jsonwebtoken';
import { useRouter } from "next/navigation";

const ExpensesReport = () => {
  const [expensesData, setExpensesData] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expenses, setExpenseTypes] = useState([]);
  const [selectedExpenseType, setSelectedExpenseType] = useState("");

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/reportLogin");
    } else {
      const decodedToken = decode(token);
      if (!decodedToken || decodedToken.role !== "superAdmin") {
        router.push("/reportLogin");
      }
    }
  }, []);

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/expensesForm");
        setExpensesData(response.data); // Assuming response.data is an array of expenses
      } catch (error) {
        console.error("Error fetching expenses data:", error);
      }
    };

    const fetchExpenseTypes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/expense/expenses");
        setExpenseTypes(response.data); // Assuming response.data is an array of expense types
      } catch (error) {
        console.error("Error fetching expense types:", error);
      }
    };

    fetchExpensesData();
    fetchExpenseTypes();
  }, []);







  function getFormattedDate() {
    const now = new Date();
    const currentHour = now.getHours();

    // If the current hour is before 3 AM, use the previous day's date
    // Otherwise, use the current date
    if (currentHour < 3) {
      const prevDay = new Date(now);
      prevDay.setDate(prevDay.getDate() - 1);
      const year = prevDay.getFullYear();
      const month = (prevDay.getMonth() + 1).toString().padStart(2, '0');
      const day = prevDay.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }


  useEffect(() => {
    // Set default values for startDate and endDate when the component mounts
    const defaultDate = getFormattedDate();
    setStartDate(defaultDate);
    setEndDate(defaultDate);
  }, []);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };







  const handleExpenseTypeChange = (event) => {
    setSelectedExpenseType(event.target.value);
  };

  const handleSearch = () => {
    // Filter the expenses based on the selected date range and expense type
    const filteredData = expensesData.filter((expense) => {
      const expenseDate = new Date(expense.date).toISOString().split("T")[0];
      return (
        expenseDate >= startDate &&
        expenseDate <= endDate &&
        (selectedExpenseType === "" || expense.expenseType === selectedExpenseType)
      );
    });

    // Set the filtered expenses to be displayed
    setFilteredExpenses(filteredData);
  };

  const handleExportToExcel = () => {
    // Extract only the desired fields from filteredExpenses
    const dataToExport = filteredExpenses.map(({ date, expenseType, description, paidBy, bankName, checkNo, online, amount }) => ({
      Date: date,
      "Expense Type": expenseType,
      Description: description,
      "Paid By": paidBy,
      "Bank Name": bankName,
      "Cheque No": checkNo,
      "Type": online,
      Amount: amount
    }));

    // Calculate totals
    const totalAmount = dataToExport.reduce((acc, expense) => acc + expense.Amount, 0);

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);



    // Add totals row
    const totalRow = { "Total Amount": totalAmount }; // Adjust the key to match your Excel column header
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const lastRow = range.e.r + 1;

    // Add the total row after the expenses data
    const totalRowIndex = lastRow + 1; // Assuming two empty rows between expenses data and total row
    XLSX.utils.sheet_add_json(worksheet, [totalRow], { origin: totalRowIndex });

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, "Expenses.xlsx");
  };



  const handlePrint = () => {
    const printContent = filteredExpenses.map((expense) => ({
      date: new Date(expense.date).toLocaleDateString("en-GB"),
      expenseType: expense.expenseType,
      description: expense.description,
      paidBy: expense.paidBy,
      bankName: expense.bankName,
      checkNo: expense.checkNo,
      online: expense.online,
      amount: expense.amount,
    }));

    // Calculate total amount
    const totalAmount = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

    const printableContent = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Expenses Report</title>
            <style>
            @page {
              size: 80(72.1)X 297 mm; /* Set the page size */
              margin: 2mm; /* Adjust the margin as needed */
            }
                body {
                    font-family: Arial, sans-serif;
                    margin: 2px;
                    padding: 0;
                    margin-bottom: 5px;
                    font-size: 8px; /* Adjust the font size as needed */
                }
                .report-header {
                    text-align: center;
                    font-size: 8px; /* Adjust the font size as needed */
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .report-content {
                    margin-top: 8px;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .table th, .table td {
                    border: 1px solid #ddd;
                    padding: 4px;
                    text-align: left;
                }
                .table th {
                    background-color: #f2f2f2;
                }
                .total-box {
                    float: right;
                    border: 1px solid #ddd;
                    padding: 4px;
                    width: 30%;
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                Expenses Report
            </div>
            <div class="report-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Expense Type</th>
                            <th>Description</th>
                            <th>Paid By</th>
                            <th>Bank Name</th>
                            <th>Cheque No</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${printContent
        .map(
          (content) => `
                            <tr>
                                <td>${content.date}</td>
                                <td>${content.expenseType}</td>
                                <td>${content.description}</td>
                                <td>${content.paidBy}</td>
                                <td>${content.bankName}</td>
                                <td>${content.checkNo}</td>
                                <td>${content.online}</td>
                                <td>${content.amount}</td>
                                
                            </tr>
                        `
        )
        .join("")}
                    </tbody>
                </table>
            </div>
            <div class="total-box">Total Amount: ${totalAmount}</div>
        </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print the report.");
      return;
    }

    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  //   const handlePrint = () => {
  //     window.print(); // Print the expenses report
  //   };

  // Calculate total amount
  const totalAmount = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 p-2 bg-white rounded-md shadow-md font-sans">
        <h1 className="text-xl font-bold mb-2">Expenses Report</h1>
        <div className="mb-4 flex flex-wrap items-center">
          <label className="mr-2 text-gray-600">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="border rounded-md p-1 text-gray-700 text-sm"
          />
          <div>
            <label className="mx-2 text-gray-600">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="border rounded-md text-gray-700 p-1 text-sm"
            />
          </div>
          <div>
            <select
              className="border rounded-md p-1 text-gray-700 text-sm ml-2"
              value={selectedExpenseType}
              onChange={handleExpenseTypeChange}
            >
              <option value="">Select an Expense</option>
              {expenses.map((expense) => (
                <option key={expense._id} value={expense.expense}>
                  {expense.expense}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap justify-between">
            <button
              className="bg-green-100 text-green-600 text-sm px-4 py-2 mr-3 rounded-full font-bold lg:ml-2 hover:bg-green-200 focus:outline-none focus:shadow-outline-green"
              onClick={handleSearch}
            >
              Search
            </button>

            <button
              className="bg-blue-100 text-blue-600 text-sm px-4 py-2 rounded-full font-bold hover:bg-blue-200 focus:outline-none focus:shadow-outline-blue"
              onClick={handleExportToExcel}
            >
              Export to Excel
            </button>
            <button
              className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full lg:ml-2 ml-2 font-bold hover:bg-gray-200 focus:outline-none focus:shadow-outline-gray"
              onClick={handlePrint}
            >
              Print
            </button>
          </div>
        </div>

        {/* Render expenses report table */}
        <div className="table-container overflow-x-auto overflow-y-auto">
          <table className="min-w-full bg-white border border-gray-300 text-left align-middle">
            <thead className="bg-gray-200">
              <tr className="text-base bg-zinc-100 text-yellow-700 border">
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Expense Type</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Paid By</th>
                <th className="border border-gray-300 px-4 py-2">Bank Name</th>
                <th className="border border-gray-300 px-4 py-2">Cheque No</th>
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(expense.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{expense.expenseType}</td>
                  <td className="border border-gray-300 px-4 py-2">{expense.description}</td>
                  <td className="border border-gray-300 px-4 py-2">{expense.paidBy}</td>
                  <td className="border border-gray-300 px-4 py-2">{expense.bankName}</td>
                  <td className="border border-gray-300 px-4 py-2">{expense.checkNo}</td>
                  <td className="border border-gray-300 px-4 py-2">{expense.online}</td>
                  <td className="border border-gray-300 px-4 py-2">{expense.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Display total amount */}
        <div className="border border-gray-300 px-4 py-2 text-right">
          <span className="font-bold">Total Amount: </span>
          <span className="font-bold">{totalAmount}</span>
        </div>
      </div>

    </>
  );
};

export default ExpensesReport;