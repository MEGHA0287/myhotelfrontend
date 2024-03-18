"use client";

// pages/Orders.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { decode } from 'jsonwebtoken';


const Reports = () => {
  const [originalOrders, setOriginalOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hotelInfo, setHotelInfo] = useState(null);


  useEffect(() => {
    // Set both start and end dates using the getFormattedDate function
    const date = getFormattedDate();
    setStartDate(date);
    setEndDate(date);
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


  // function getTodayDate() {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, "0");
  //   const day = String(today.getDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // }

  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        // Fetch all hotels
        const allHotelsResponse = await axios.get(
          "http://localhost:5000/api/hotel/get-all"
        );
        const allHotels = allHotelsResponse.data;

        // Assuming you want to use the first hotel's ID (you can modify this logic)
        const defaultHotelId = allHotels.length > 0 ? allHotels[0]._id : null;

        if (defaultHotelId) {
          // Fetch information for the first hotel
          const response = await axios.get(
            `http://localhost:5000/api/hotel/get/${defaultHotelId}`
          );
          const hotelInfo = response.data;

          setHotelInfo(hotelInfo);
        } else {
          console.error("No hotels found.");
        }
      } catch (error) {
        console.error("Error fetching hotel information:", error);
      }
    };

    fetchHotelInfo();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/order/orders/date?startDate=${startDate}&endDate=${endDate}`
      );

      const ordersWithTableNames = await Promise.all(
        response.data.map(async (order) => {
          const tableResponse = await axios.get(
            `http://localhost:5000/api/table/tables/${order.tableId}`
          );
          return {
            ...order,
            tableName: tableResponse.data.tableName || "Unknown Table",
          };
        })
      );

      setOrders(ordersWithTableNames);
      setOriginalOrders(ordersWithTableNames);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Error fetching orders");
      setLoading(false);
    }
  };

  const calculateTotal = (fieldName) => {
    return orders.reduce((total, order) => {
      // Convert the field value to a number before adding to the total
      const fieldValue = parseFloat(order[fieldName]) || 0;
      return total + fieldValue;
    }, 0);
  };

  const handleSearch = () => {
    const filteredOrders = originalOrders.filter((order) => {
      const orderDate = new Date(order.orderDate).toISOString().split("T")[0];
      const start = startDate || "0000-01-01";
      const end = endDate || "9999-12-31";
      return orderDate >= start && orderDate <= end;
    });

    setOrders(filteredOrders);
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate]); // Update the effect dependencies to include startDate and endDate

  const handlePrint = () => {
    const printContent = orders.map((order) => ({
      tableName: order.tableName,
      items: order.items.map(
        (item) =>
          `${item.name} x ${item.quantity} - Rs.${item.price * item.quantity}`
      ),
      total: order.total,
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

    const startDates = formatDate(startDate);



    const printableContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Table Reports</title>
      <style>
        @page {
          margin: 2mm; /* Adjust the margin as needed */
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .report-header {
          margin-top: -11px;
          color: black;
          font-size: 17px;
          padding: 10px;
          text-align: center;
        }
        
        .date-range {
          font-size: 13px;
          margin: -8px 0;
          text-align: center;
          
        }
        
        .report-content {
          margin-top: 10px;
          width: 260px;
        }
        
        .table {
          width: 100%;
          border: 1px dotted black;
          border-collapse: collapse;
        }
        
        .table_downward {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        
        .table th, .table td {
        
          padding: 4px;
          text-align: center;
        }
        
        .bg-gray-100 {
       
          border-bottom: 1px dotted black;
          padding:1px
        }
        
        .label {
          font-weight: normal;
        }
        
        .value {
          font-weight: normal;
        }
        
        .hotel-name {
          font-size: 25px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
        }
        
      </style>
    </head>
    <body>
    <div class="hotel-name">
     ${hotelInfo.hotelName}
  </div>
    <div class="report-header">
      Daily Manager Reports
    </div>
    <div class="date-range">
   Today's Date: ${startDates}
    </br>
    Date: ${dateRange}
 
    </div>
    <div class="report-content">
      <table class="table">
        <tbody>
          <tr class="bg-gray-100 table_downward">
            <td class="label">Subtotal:</td>
            <td class="value">₹${calculateTotal("subtotal")}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">Discount:</td>
            <td class="value">₹${calculateTotal("discount")}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">CGST:</td>
            <td class="value">₹${Math.round(calculateTotal("CGST"))}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">SGST:</td>
            <td class="value">₹${Math.round(calculateTotal("SGST"))}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">Cash:</td>
            <td class="value">₹${Math.round(calculateTotal("cashAmount"))}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">Online:</td>
            <td class="value">₹${Math.round(calculateTotal("onlinePaymentAmount"))}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">Compliment:</td>
            <td class="value">₹${Math.round(calculateTotal("complimentaryAmount"))}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">Credit:</td>
            <td class="value">₹${Math.round(calculateTotal("dueAmount"))}</td>
          </tr>
          <tr class="bg-gray-100 table_downward">
            <td class="label">Grand Total:</td>
            <td class="value">${Math.round(
      calculateTotal("total")
    ).toLocaleString("en-IN", {

      currency: "INR",
    })}</td>
          </tr>
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

  const handleDetailedPrint = () => {
    const detailedPrintContent = orders.map((order, index) => ({
      srNumber: index + 1,
      billNumber: order.orderNumber.replace(/\D/g, ""),
      date: new Date(order.orderDate).toLocaleDateString("en-GB"),
      tableName: order.tableName,
      cash: order.cashAmount,
      online: order.onlinePaymentAmount,
      grandTotal: Math.round(order.total).toLocaleString("en-IN", {

        currency: "INR",
      }),
      // Add any additional details you want to include in the detailed print
      // For example, order date, order number, etc.
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

    const startDates = formatDate(startDate);

    const detailedPrintableContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Detailed Reports</title>
        <style>
          @page {
            margin: 2mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .report-header {
            margin-top: -11px;
            color: black;
            font-size: 17px;
            padding: 10px;
            text-align: center;
          }
          .date-range {
            font-size: 13px;
            margin: -8px 0;
            text-align: center;
            
          }
          .report-content {
            margin-top: 10px;
            width: 100%;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table th, .table td {
            border: 1px solid black;
            padding: 3px;
            text-align: center;
          }
          .table th {
            background-color: #f2f2f2;
          }
          .hotel-name {
            font-size: 25px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="hotel-name">
          ${hotelInfo.hotelName}
        </div>
     
        <div class="report-header">
        Daily Manager Reports
      </div>
     
  <div class="date-range">
 Today's Date: ${startDates}
  </br>
  Date: ${dateRange}
   
   
      </div>
        <div class="report-content">
          <table class="table">
            <thead>
              <tr>
               
                <th>Bill</th>
                <th>Date</th>
                <th>Table</th>
                <th>Cash</th>
                <th>Online</th>
                <th> Total</th>
                <!-- Add any additional headers here -->
              </tr>
            </thead>
            <tbody>
              ${detailedPrintContent.map(
      (detail) => `
                  <tr>
                  
                    <td>${detail.billNumber}</td>
                    <td>${detail.date}</td>
                    <td>${detail.tableName}</td>
                    <td>${Math.round(detail.cash)}</td>
                    <td>${Math.round(detail.online)}</td>
                    <td>${Math.round(detail.grandTotal)}</td>
                    <!-- Add any additional data cells here -->
                  </tr>
                `
    ).join('')}
              <tr>
              <td colspan="3"> Total:</td>
              <td>₹${Math.round(calculateTotal("cashAmount"))}</td>
              <td>₹${Math.round(calculateTotal("onlinePaymentAmount"))}</td>
              <td>₹${Math.round(calculateTotal("total"))}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="report-content">
    <table class="table">
      <tbody>
        <tr class="bg-gray-100 table_downward">
          <td class="label">Subtotal:</td>
          <td class="value">₹${calculateTotal("subtotal")}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">Discount:</td>
          <td class="value">₹${calculateTotal("discount")}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">CGST:</td>
          <td class="value">₹${Math.round(calculateTotal("CGST"))}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">SGST:</td>
          <td class="value">₹${Math.round(calculateTotal("SGST"))}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">Cash:</td>
          <td class="value">₹${Math.round(calculateTotal("cashAmount"))}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">Online:</td>
          <td class="value">₹${Math.round(calculateTotal("onlinePaymentAmount"))}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">Compliment:</td>
            <td class="value">₹${Math.round(calculateTotal("complimentaryAmount"))}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">Credit:</td>
          <td class="value">₹${Math.round(calculateTotal("dueAmount"))}</td>
        </tr>
        <tr class="bg-gray-100 table_downward">
          <td class="label">Grand Total:</td>
          <td class="value">${Math.round(
      calculateTotal("total")
    ).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    })}</td>
        </tr>
      </tbody>
    </table>
  </div>
      </body>
    </html>
  `;



    const detailedPrintWindow = window.open("", "_blank");

    if (!detailedPrintWindow) {
      alert("Please allow pop-ups to print the detailed report.");
      return;
    }

    detailedPrintWindow.document.write(detailedPrintableContent);
    detailedPrintWindow.document.close();
    detailedPrintWindow.print();
    detailedPrintWindow.close();
  };
  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 p-2 bg-white rounded-md shadow-md font-sans overflow-x-auto">
        <h1 className="text-xl font-bold mb-2 text-orange-500">Daily Order Reports</h1>
        <div className="mb-4 lg:flex md:flex items-center">
          <label className="mr-2 mb-2 text-gray-600">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mb-2 mr-2 w-md md:w-auto border rounded-md p-1 text-gray-700 text-sm"
          />
          <div>
            <label className="mx-2 mb-2 text-gray-600">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mb-2 mr-2 w-md md:w-auto border rounded-md p-1 text-gray-700 text-sm"
            /></div>
          <div className="mt-3">
            <button
              className="mb-2 md:ml-4 w-md md:w-auto bg-yellow-100 text-yellow-600 text-sm px-4 py-2 rounded-full font-bold hover:bg-yellow-200 focus:outline-none focus:shadow-outline-green"
              onClick={handlePrint}
            >
              Print
            </button>
            <button
              className="mb-2 ml-3 md:ml-4 w-md md:w-auto bg-blue-100 text-blue-600 text-sm px-4 py-2 rounded-full font-bold hover:bg-blue-200 focus:outline-none focus:shadow-outline-blue"
              onClick={handleDetailedPrint}
            >
              Print Detailed
            </button>
          </div>
        </div>
        {loading ? (
          <p className="text-gray-700">Loading orders...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="text-base bg-zinc-100 text-yellow-700 border">
                <tr>
                  <th className="px-3 py-2  text-left text-xs leading-4 font-medium  uppercase tracking-wider whitespace-nowrap">
                    SR No
                  </th>
                  <th className="px-3 py-2  text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-2  text-center text-xs leading-4 font-medium  uppercase tracking-wider whitespace-nowrap">
                    Table Name
                  </th>
                  <th className="px-2 py-1  text-center text-xs leading-4 font-medium  uppercase tracking-wider whitespace-nowrap">
                    Bill No.
                  </th>

                  <th className=" text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className=" text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    CGST
                  </th>
                  <th className=" text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    SGST
                  </th>
                  <th className="px-2 py-1 text-center text-xs leading-4 font-medium  uppercase tracking-wider whitespace-nowrap">
                    Grand Total
                  </th>
                  <th className="px-3 py-2  text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    Discount
                  </th>

                  <th className="px-3 py-2  text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    Cash
                  </th>
                  <th className="px-3 py-2  text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    Online
                  </th>
                  <th className="px-3 py-2  text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    Compliment
                  </th>
                  <th className="px-3 py-2  text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                    Credit
                  </th>

                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-1  text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {index + 1}
                    </td>
                    <td className="px-6 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.tableName}
                    </td>
                    
                    <td className="px-6 py-1  text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.orderNumber.replace(/\D/g, "")}
                    </td>
                    <td className="px-4 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.subtotal}
                    </td>
                    <td className="px-4 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.CGST}
                    </td>
                    <td className="px-4 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.SGST}
                    </td>
                    <td className="px-6 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {Math.round(order.total)}
                    </td>
                    <td className="px-4 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.discount || 0}
                    </td>
                    <td className="px-4 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.cashAmount}
                    </td>
                    <td className="px-4 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {Math.round(order.onlinePaymentAmount)}
                    </td>
                    <td className="px-4 py-1  text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {order.complimentaryAmount}
                    </td>
                    <td className="px-6 py-1 text-sm whitespace-no-wrap border-b border-gray-200 text-center">
                      {Math.round(order.dueAmount)}
                    </td>

                  </tr>
                ))}

                <tr className="bg-gray-100">
                  <td
                    className="px-6  whitespace-no-wrap border-b border-gray-200"
                    colSpan="3"
                  ></td>
                  <td className="px-6  whitespace-no-wrap border-b border-gray-200 font-bold"></td>
                  <td className="px-6  whitespace-no-wrap border-b border-gray-200 font-bold">
                    Subtotal:
                  </td>
                  <td className="px-4  whitespace-no-wrap border-b border-gray-200 font-bold">
                    CGST:
                  </td>
                  <td className="px-4  whitespace-no-wrap border-b border-gray-200 font-bold">
                    SGST:
                  </td>
                  <td className="px-2 py-2 whitespace-no-wrap border-b border-gray-200 font-bold whitespace-nowrap">
                    Grand Total:
                  </td>
                  <td className="px-6  whitespace-no-wrap border-b border-gray-200 font-bold">
                    Discount:
                  </td>

                  <td className="px-6  whitespace-no-wrap border-b border-gray-200 font-bold">
                    Cash:
                  </td>
                  <td className="px-2  whitespace-no-wrap border-b border-gray-200 font-bold">
                    Online:
                  </td>
                  <td className="px-2  whitespace-no-wrap border-b border-gray-200 font-bold">
                    Compliment:
                  </td>
                  <td className="px-2 py-2 whitespace-no-wrap border-b border-gray-200 font-bold">
                    Credit:
                  </td>

                  {/* Add more cells here if needed */}
                </tr>
                <tr className="bg-gray-100">
                  <td
                    className="px-6 py-2 whitespace-no-wrap border-b border-gray-200"
                    colSpan="3"
                  ></td>
                  <td className="px-6 py-2 whitespace-no-wrap border-b border-gray-200 font-bold"></td>
                  <td className="px-6 py-2 whitespace-no-wrap border-b border-gray-200 font-bold">
                    ₹{calculateTotal("subtotal")}
                  </td>
                  <td className="px-4 py-2 whitespace-no-wrap border-b border-gray-200 font-bold">
                    ₹{Math.round(calculateTotal("CGST"))}
                  </td>
                  <td className="px-4 py-2 whitespace-no-wrap border-b border-gray-200 font-bold">
                    ₹{Math.round(calculateTotal("SGST"))}
                  </td>
                  <td className="px-4 py-2 whitespace-no-wrap border-b border-gray-200 font-bold">
                    {Math.round(calculateTotal("total")).toLocaleString(
                      "en-IN",
                      { style: "currency", currency: "INR" }
                    )}
                  </td>
                  <td className="px-6 py-2 whitespace-no-wrap border-b border-gray-200 font-bold text-center">
                    ₹{calculateTotal("discount")}
                  </td>

                  <td className="px-4 py-2 whitespace-no-wrap border-b border-gray-200 font-bold">
                    ₹{calculateTotal("cashAmount")}
                  </td>
                  <td className="px-4 py-2 whitespace-no-wrap border-b border-gray-200 font-bold">
                    ₹{Math.round(calculateTotal("onlinePaymentAmount"))}
                  </td>
                  <td className="px-4 py-2 whitespace-no-wrap border-b border-gray-200 font-bold text-center">
                    ₹{calculateTotal("complimentaryAmount")}
                  </td>
                  <td className="px-4 py-2 whitespace-no-wrap border-b border-gray-200 font-bold text-center">
                    ₹{Math.round(calculateTotal("dueAmount"))}
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;