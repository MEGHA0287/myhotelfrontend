"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar";
import { decode } from 'jsonwebtoken';
import { useRouter } from "next/navigation";

const OrderHistoryList = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    // Fetch order history when the component mounts
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/logHistory/order-history"
        );
        setOrderHistory(response.data);
      } catch (error) {
        console.error("Error fetching order history:", error);
      }
    };

    fetchOrderHistory();
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

  // Handle change functions for startDate and endDate
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };


  
  const uniqueOrderHistory = orderHistory.reduce(
    (uniqueOrders, historyItem) => {
      const existingOrder = uniqueOrders.find(
        (order) =>
          order.orderNumber === historyItem.orderNumber &&
          order.amount === historyItem.updatedFields?.total
      );

      if (!existingOrder) {
        uniqueOrders.push({
          orderNumber: historyItem.orderNumber,
          amount: historyItem.updatedFields?.total,
          details: historyItem,
        });
      }

      return uniqueOrders;
    },
    []
  );



  const handleSearch = () => {
    // Filter the orders based on the selected date range
    const filteredData = orderHistoryWithDifference.filter((historyItem) => {
      const historyItemDate = new Date(historyItem.timestamp)
        .toISOString()
        .split("T")[0];
      return historyItemDate >= startDate && historyItemDate <= endDate;
    });

    // Set the filtered orders to be displayed
    setFilteredOrders(filteredData);
  };

  const handleExportToExcel = () => {
    // Create a worksheet
    const worksheet = XLSX.utils.book_new();

    // Create a merged table by combining both tables
    const mainTable = document.getElementById("orderHistoryTable");
    const additionalTable = document.getElementById("additionalTable");

    // Get the content of both tables
    const mainTableContent = XLSX.utils.table_to_sheet(mainTable);
    const additionalTableContent = XLSX.utils.table_to_sheet(additionalTable);

    // Convert mainTableContent into an array
    const mainTableArray = XLSX.utils.sheet_to_json(mainTableContent, {
      header: 1,
    });

    // Append the additional table content to the main table content
    for (let i = 0; i < additionalTableContent.length; i++) {
      mainTableArray.push(additionalTableContent[i]);
    }

    // Insert an empty row as a gap between the two tables
    mainTableArray.push([]);

    // Convert the modified array back to a worksheet
    const mergedTableContent = XLSX.utils.aoa_to_sheet(mainTableArray);

    // Append the merged table to the worksheet
    XLSX.utils.book_append_sheet(worksheet, mergedTableContent, "OrderHistory");

    // Save the workbook as an Excel file
    XLSX.writeFile(worksheet, "OrderHistory.xlsx");
  };

  const handlePrint = () => {
    const printContent = filteredOrders.map((historyItem) => ({
      orderNumber: historyItem.orderNumber,
      date: new Date(historyItem.timestamp).toLocaleDateString("en-GB"),
      items: historyItem.updatedFields?.items.map(
        (item) => `${item.name} X ${item.quantity}`
      ),
      amount: Math.round(historyItem.updatedFields?.total),
      difference: historyItem.difference,
    }));

    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(dateString).toLocaleDateString("en-GB", options);
    };

    const startDateFormatted = formatDate(startDate);
    const endDateFormatted = formatDate(endDate);
    const dateRange =
      startDate && endDate
        ? `${startDateFormatted} - ${endDateFormatted}`
        : "(All Dates)";

    const printableContent = `
        <!DOCTYPE html>
<html>
<head>
    <title>Edit Order Reports</title>
    <style>
      @page {
        margin: 2mm; /* Adjust the margin as needed */
      }
      body {
        font-family: 'sans-serif' ; /* Specify a more common Courier font */
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        box-sizing: border-box;
     
      }
      * {
       
      box-sizing: border-box;
    }
      .container {
        max-width: 600px;
        padding: 10px 10px;
        justify-content: center;
        align-items: center;
        text-align: center;
        background-color: #fff;
        box-shadow: 0 0 10px black;
      }
     
      .hotel-details p {
        text-align: center;
        margin-top: -10px;
        font-size: 12px;
      }
     
      .order_details_border {
        margin-left: 10px;
        position: relative;
        top: 2rem;
      }
     
      .container .total-section {
        justify-content: space-between;
        display: flex;
      }
     
      .margin_left_container {
        margin-left: -2rem;
      }
     
      .container {
        margin: 1rem;
        align-items: center;
        height: fit-content; /* Changed 'fit' to 'fit-content' */
      }
     
      .contact-details p {
        display: inline-block;
      }
     
      .hotel-details {
        text-align: center;
        margin-bottom: -10px;
      }
     
      .hotel-details h4 {
        font-size: 20px;
        margin-bottom: 10px;
      }
     
      .hotel-details .address {
        font-size: 12px;
        margin-bottom: 10px;
      }
     
      .hotel-details p {
        font-size: 12px;
      }
     
      .contact-details {
        align-items: center;
        text-align: center;
        width: 100%;
        display: flex;
        font-size: 12.8px;
        justify-content: space-between;
      }
     
      .bill-no {
        font-size: 12.8px;
        border-top: 1px dotted gray;
      }
     
      .tableno p {
        font-size: 12.8px;
      }
     
      .waiterno p {
        font-size: 12.8px;
      }
     
      .tableAndWaiter {
        display: flex;
        align-items: center;
        font-size: 12.8px;
        justify-content: space-between;
        border-top: 1px dotted gray;
      }
     
      .waiterno {
        /* Missing 'display: flex;' */
        display: flex;
        font-size: 12.8px;
      }
     
      .order-details table {
        border-collapse: collapse;
        width: 100%;
        font-size: 12.8px;
        border-top: 1px dotted gray;
      }
     
     
    .order-details{
     margin-top:-14px
     font-size: 12.8px;

    }

         

      .order-details th {
        padding: 8px;
        text-align: left;
        font-size: 12.8px;
        border-top: 1px dotted gray;
      }
     
      .order-details td,
      .order-details th {
        border-bottom: none;
        text-align: left;
        padding: 4px;
        font-size: 12.8px;
      }
     
   
     
      .margin_left_container {
        margin-left: 20px;
        font-size: 12.8px;
      }
     
      .thdots {
        border-top: 1px dotted gray;
        padding-top: 2px;
      }
     
      .itemsQty {
        border-top: 1px dotted gray;
        margin-top: 5px;
        margin-bottom: 5px;
        font-size: 12.8px;
      }
     
      .itemsQty p {
        margin-top: 2px;
        font-size: 12.8px;
      }
     
      .subtotal,
      .datas {
        margin-top: 18px;
        font-size: 12.8px;
      }
     
      .datas {
        text-align: right;
      }
     
      .subtotal p {
        margin-top: -11px;
       
      }
     
      .datas p {
        margin-top: -11px;
   
      }
     
      .subtotalDatas {
        display: flex;
        border-top: 1px dotted gray;
        justify-content: space-between;
        margin-top: -9px;
      }
     
      .grandTotal {
        font-size: 19px;
     
      }
     
      .totalprice {
        text-align: right;
      }
     
      .table-class th {
        font-weight: 400;
      }
     
      .table-class th {
        align-items: center;
        text-align: left;
      }
     
      .tableAndWaiter p {
        margin-top: -10px;
      }
     
      .billNo {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: space-between;
      }
     
      .billNo p {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: space-between;
      }
     
      .footer {
        border-top: 1px dotted gray;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: -2.6rem;
      }
     
      .footer p {
        margin-top: 2px;
      }
     
      .datetime-containers {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.8px;
        margin-bottom: 10px; /* Adjust the margin as needed */
      }
     
      .label {
        margin-top: -25px;
      }
     
      .datetime-containers p {
        font-size: 10px;
        margin: 0; /* Remove default margin for paragraphs inside .datetime-containers */
      }
     
      .label {
        margin-top: -25px;
      }
     
      .footerss {
        margin-top: 25px;
      }
     
   
      .tableAndWaiter {
        margin-top: -7px;
      }
     
      .tableno {
        border-top: 1px dotted gray;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .tableno p{
        margin-top:4px
      }
      /* Align the Price column to the right */
      .table-class th:nth-child(4),
      .table-class td:nth-child(4) {
        text-align: right;
      }
     
      /* Center the SR column */
      .table-class th:nth-child(1),
      .table-class td:nth-child(1) {
        text-align: center;
      }
     
      /* Set a fixed width for the SR and Price columns if needed */
      .table-class th:nth-child(1),
      .table-class td:nth-child(1),
      .table-class th:nth-child(4),
      .table-class td:nth-child(4) {
        width: 31px; /* Adjust the width as needed */
      }
     
        .reduce-space {
        margin-bottom: 4px;
      }
          .reduce-margin-top {
        margin-top: -25px;
      }
      .order-details table {
        border-collapse: collapse;
        width: 100%;
        border-top: 1px dotted gray;
      }
     
     
    .order-details{
     margin-top:-24px
     position:absolute

    }

         

      .order-details th {
        padding: 8px;
        text-align: left;
        border-top: 1px dotted gray;
      }
     
      .order-details td,
      .order-details th {
        border-bottom: none;
        text-align: left;
        padding: 2px;
      }
     
      .big-text {
        display: flex;
        flex-direction: column;
      }
      .big-text span{
        font-size:12.5px
      }
        .small-text {
          font-size: 10px; /* Adjust the font size as needed */
        }
        .order-details tbody {
          margin-top: 0px; /* Set margin-top to 0 to remove extra margin */
        }

        .order-details td,
        .order-details th {
          vertical-align: middle;
        }
        .table-class td:nth-child(1) {
          text-align: left;
        }
        .table-class th:nth-child(1) {
          text-align: left;
      }
      .table-class th:nth-child(3) {
        text-align: left;
    }
    .brab{
      margin-top:-20px
    }
    .waiterName{
      margin-top:-20px
   
    }
    .waiterName p{
     
      font-size:12.5px
    }
  </style>
</head>
<body>
    <div class="report-header">
        Edit Order Reports
    </div>
    <div class="date-range">
        Date Range: ${dateRange}
    </div>
    <div class="report-content">
        <table class="table">
            <thead>
                <tr>
                    <th>Order Number</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Difference</th>
                </tr>
            </thead>
            <tbody>
                ${printContent
                  .map(
                    (content) => `
                        <tr>
                            <td>${content.orderNumber}</td>
                            <td>${content.date}</td>
                            <td>${content.amount}</td>
                            <td>${content.difference}</td>
                        </tr>
                    `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
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

  const lastAmounts = {};

  // Calculate the difference for each order number
  const orderHistoryWithDifference = orderHistory.map(
    (historyItem, index, array) => {
      const orderNumber = historyItem.orderNumber;
      const currentAmount = Math.round(historyItem.updatedFields?.total);
      const lastAmount = lastAmounts[orderNumber] || 0;

      // Check if the item is part of filtered orders
      const filteredItem = filteredOrders.find(
        (filtered) => filtered.details?._id === historyItem._id
      );

      // Calculate the difference based on whether it's a filtered item or not
      let difference;
      if (filteredItem && filteredItem.details) {
        // If it's a filtered item, calculate the difference using filtered item's details
        const filteredAmount = Math.round(
          filteredItem.details.updatedFields?.total
        );
        difference = filteredAmount - lastAmount;
      } else {
        // If it's not a filtered item, calculate the difference using current item's details
        const isLastRow = array
          .slice(index + 1)
          .every((item) => item.orderNumber !== orderNumber);
        difference = isLastRow ? currentAmount - lastAmount : "";

        // If the difference is less than the current amount, add a minus sign
        if (currentAmount < lastAmount) {
          difference = `-${Math.abs(difference)}`;
        }
      }

      lastAmounts[orderNumber] = currentAmount;

      return {
        ...historyItem,
        difference,
      };
    }
  );

  const filteredOrderTotals = filteredOrders.reduce(
    (totals, historyItem, index, array) => {
      const orderNumber = historyItem.orderNumber;
      const currentAmount = Math.round(historyItem.updatedFields?.total);

      // Update the total for the first occurrence of the order number
      if (!totals.firstOccurrenceTotals[orderNumber]) {
        totals.firstOccurrenceTotals[orderNumber] = currentAmount;
      }

      totals.lastOccurrenceTotals[orderNumber] = currentAmount;
      // Check if it's the last occurrence of the order number
      const isLastRow = array
        .slice(index + 1)
        .every((item) => item.orderNumber !== orderNumber);

      // If it's the last occurrence, update the total and mark it
      if (isLastRow) {
        totals.lastOccurrenceTotals[orderNumber] = currentAmount;

        // Record this as the last occurrence order number
        totals.lastOccurrenceOrderNumber = orderNumber;
      }

      return totals;
    },
    {
      firstOccurrenceTotals: {},
      lastOccurrenceTotals: {},
      lastOccurrenceOrderNumber: null,
    }
  );

  const firstOccurrenceTotalAmount = Object.values(
    filteredOrderTotals.firstOccurrenceTotals
  ).reduce((sum, amount) => sum + amount, 0);

  const lastOccurrenceTotalAmount = Object.values(
    filteredOrderTotals.lastOccurrenceTotals
  ).reduce((sum, amount) => sum + amount, 0);

  const encounteredOrderNumbers = new Set();
  const difference = lastOccurrenceTotalAmount - firstOccurrenceTotalAmount;

  const lastOccurrenceOrderNumber =
    filteredOrderTotals.lastOccurrenceOrderNumber;

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 p-2 bg-white rounded-md shadow-md font-sans">
        <h1 className="text-xl font-bold mb-2">Edit Bill Reports</h1>
        <div className="mb-4 flex flex-wrap items-center">
          <label className="mr-2 text-gray-600">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="border rounded-md p-1 text-gray-700 text-sm"
          />
          <div className="mt-2 lg:mt-0 md:mt-0">
          <label className="mx-2 text-gray-600 ">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="border rounded-md p-1 text-gray-700 text-sm"
          />
          </div>
          <div className=" flex flex-wrap">
          <button
            className="bg-green-100 text-green-600 text-sm px-4 py-2 rounded-full font-bold ml-2 mt-2 md:mt-0 hover:bg-green-200 focus:outline-none focus:shadow-outline-green"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="bg-yellow-100 text-yellow-600 text-sm px-4 py-2 rounded-full font-bold ml-2 mt-2 md:mt-0 hover:bg-yellow-200 focus:outline-none focus:shadow-outline-green"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            className="bg-blue-100 text-blue-600 text-sm px-4 py-2 rounded-full font-bold ml-4 mt-2 md:mt-0 hover:bg-blue-200 focus:outline-none focus:shadow-outline-blue"
            onClick={handleExportToExcel}
          >
            Export to Excel
          </button>
          </div>
        </div>


        {/* Additional Table */}
        <div id="additionalTable" className="pl-10 mb-4">
          <table className="border-collapse border border-gray-300 min-w-md divide-y divide-gray-200">
            <thead className="text-base bg-zinc-100 text-yellow-700 border"></thead>
            <tbody>
              <tr>
                <td className="text-base bg-zinc-100 text-yellow-700 border p-2">
                  <strong>Original Bill Amount:</strong>
                </td>
                <td className="text-base bg-zinc-100 text-yellow-700 border p-2">
                  {firstOccurrenceTotalAmount}
                </td>
              </tr>
              <tr>
                <td className="text-base bg-zinc-100 text-yellow-700 border p-2">
                  <strong>Edited Bill Amount:</strong>
                </td>
                <td className="text-base bg-zinc-100 text-yellow-700 border p-2">
                  {lastOccurrenceTotalAmount}
                </td>
              </tr>
              <tr>
                <td className="text-base bg-zinc-100 text-yellow-700 border p-2">
                  <strong>Difference:</strong>
                </td>
                <td className="text-base bg-zinc-100 text-yellow-700 border p-2">
                  {difference}
                </td>
              </tr>
            </tbody>
          </table>
        </div>


  <div className="overflow-x-auto">

        {filteredOrders.length > 0 ? (
          <div
            id="orderHistoryTable"
            className="max-w-5xl flex pl-0 lg:pl-10"
          >
          <table className="border-collapse border border-gray-300 w-full divide-y divide-gray-200 overflow-x-auto">
          <thead className="text-base bg-zinc-100 text-yellow-700 border overflow-x-auto">
          <tr>
                  <th className="border border-gray-300 whitespace-nowrap">Bill No.</th>
                  <th className="p-2 border border-gray-300">Date</th>
                  <th className="p-2 border border-gray-300">Items</th>
                  <th className="p-2 border border-gray-300">Amount</th>
                  <th className="p-2 border border-gray-300">Difference</th>
                </tr>
              </thead>

              <tbody className="text-center">
              {filteredOrders.length > 0
                  ? // If there are filtered orders, display them
                    filteredOrders.map((historyItem, index) => {
                      const orderNumber = historyItem.orderNumber.replace(
                        /\D/g,
                        ""
                      );
                      const isFirstOccurrence =
                        !encounteredOrderNumbers.has(orderNumber);

                      // Determine the background color based on the difference
                      const bgColorClass =
                        historyItem.difference < 0
                          ? "bg-red-100 text-red-600"
                          : isFirstOccurrence
                          ? "bg-green-100 text-green-700"
                          : "bg-white text-gray";

                      // If it's the first occurrence, add to the set
                      if (isFirstOccurrence) {
                        encounteredOrderNumbers.add(orderNumber);
                      }
                      return (
                        <tr key={historyItem._id} className={bgColorClass}>
                          <td className="border border-gray-300 pl-2">
                            {orderNumber}
                          </td>
                          <td className="border border-gray-300">
                            {new Date(historyItem.timestamp).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            {historyItem.updatedFields?.items?.map(
                              (item, itemIndex) => (
                                <div key={itemIndex}>
                                  <span>
                                    {item.name} X {item.quantity}
                                  </span>
                                </div>
                              )
                            )}
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            {Math.round(historyItem.updatedFields?.total)}
                          </td>
                          <td className="border border-gray-300">
                            {historyItem.difference}
                          </td>
                        </tr>
                      );
                    })
                  : // If there are no filtered orders, display all orders
                    orderHistoryWithDifference.map((historyItem, index) => {
                      const orderNumber = historyItem.orderNumber.replace(
                        /\D/g,
                        ""
                      );
                      const isFirstOccurrence =
                        !encounteredOrderNumbers.has(orderNumber);

                      // Determine the background color based on the difference
                      const bgColorClass =
                        historyItem.difference < 0
                          ? "bg-red-100 text-red-600"
                          : isFirstOccurrence
                          ? "bg-green-100 text-green-700"
                          : "bg-white text-gray";

                      // If it's the first occurrence, add to the set
                      if (isFirstOccurrence) {
                        encounteredOrderNumbers.add(orderNumber);
                      }
                      return (
                        <tr key={historyItem._id} className={bgColorClass}>
                          <td className="border border-gray-300 px-1 py-1">
                            {orderNumber}
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            {new Date(historyItem.timestamp).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            {historyItem.updatedFields?.items?.map(
                              (item, itemIndex) => (
                                <div key={itemIndex}>
                                  <span>
                                    {item.name} X {item.quantity}
                                  </span>
                                </div>
                              )
                            )}
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            {Math.round(historyItem.updatedFields?.total)}
                          </td>
                          <td className="border border-gray-300">
                            {index % 2 === 1
                              ? historyItem.difference || ""
                              : ""}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
            
          </div>
        ) : (
          <table className="border-collapse border border-gray-300 w-3/4 divide-y divide-gray-200">
            <thead className="text-base bg-zinc-100 text-yellow-700 border">
              <tr>
                <th className="border border-gray-300">Bill No.</th>
                <th className="p-2 border border-gray-300">Date</th>
                <th className="p-2 border border-gray-300">Items</th>
                <th className="p-2 border border-gray-300">Amount</th>
                <th className="p-2 border border-gray-300">Difference</th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr>
                <td className="border border-gray-300 p-2">
                  {/* No records found for the selected date range. */}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      </div>

    </>
  );
};

export default OrderHistoryList;