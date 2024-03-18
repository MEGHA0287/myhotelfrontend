'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { decode } from 'jsonwebtoken';

const MenuStatisticsComponent = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [menuStatistics, setMenuStatistics] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);


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
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/order/menu-statistics${startDate && endDate
            ? `?startDate=${startDate}&endDate=${endDate}`
            : ''
          }`
        );
        setMenuStatistics(response.data.menuStatistics);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    // Calculate totals when menuStatistics changes
    let quantitySum = 0;
    let amountSum = 0;

    Object.keys(menuStatistics).forEach((menu) => {
      quantitySum += menuStatistics[menu].totalQuantity;
      amountSum += menuStatistics[menu].totalPrice;
    });

    setTotalQuantity(quantitySum);
    setTotalAmount(amountSum);
  }, [menuStatistics]);

  const exportToExcel = () => {
    const data = Object.keys(menuStatistics).map((menu) => ({
      MenuName: menu,
      // Quantity: menuStatistics[menu].count,
      Qunatity: menuStatistics[menu].totalQuantity,
      TotalAmount: menuStatistics[menu].totalPrice,
    }));

    // Add the total row to the data array
    data.push({
      MenuName: 'Total',
      // Quantity: '', // You may set this to an empty string or any value you prefer
      Qunatity: totalQuantity,
      TotalAmount: totalAmount,
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MenuStatistics');
    XLSX.writeFile(wb, 'menu_Report.xlsx');
  };

  const printReport = () => {
    const printContent = Object.keys(menuStatistics).map((menu) => ({
      menuName: menu,
      quantity: menuStatistics[menu].totalQuantity,
      total: menuStatistics[menu].totalPrice,
      price: menuStatistics[menu].price,
      totalAmount: menuStatistics[menu].totalPrice,
    }));


    const tfootContent = `
      <tfoot>
        <tr class="bg-gray-100">
          <td></td>
          <td class="vertical-line value font-semibold">Total:<br> ${totalQuantity}</td>
          <td class="vertical-line value font-semibold">Total:<br> ${totalAmount}</td>
        </tr>
      </tfoot>
    `;

    const printableContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Report</title>
    <style>

      @page {
    size: 80(72.1)X 297 mm; /* Set the page size */
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
        font-size: 10px;
        padding: 10px;
        text-align: center;
      }
      
      .date-range {
        font-size: 13px;
        margin: -4px 0;
        text-align: left;
      }
      
      .report-content {
        margin-top: 10px;
        width: 100%; /* Make the report content width 100% */
        overflow-x: auto; /* Allow horizontal scrolling if needed */
      }
      
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .table th, .table td {
        padding: 5px; /* Adjust padding as needed */
        font-size: 10px; /* Adjust font size as needed */
        text-align: center;
        border: 1px solid black;
        word-wrap: break-word; /* Allow content to wrap within cells */
        max-width: 100px; /* Limit maximum width of the cell */
        overflow: hidden;
      }
      
      .table .vertical-line {
        border-left: 1px solid black;
        border-right: 1px solid black;
      }
      
      .bg-gray-100 {
        border-bottom: 1px solid black;
        padding: 1px;
      }
      
      .label {
        font-weight: normal;
      }
      
      .value {
        font-weight: normal;
      }
    </style>
  </head>
  <body>
  
  <div class="report-header">
    Menu Report
  </div>
  <div class="date-range">
  Date Range: ${new Date(startDate).toLocaleDateString('en-GB')} - ${new Date(endDate).toLocaleDateString('en-GB')}
    </br>
  </div>
  <div class="report-content">
    <table class="table">
      <thead>
        <tr class="bg-gray-100">
          <th class="label">Menu Name</th>
          <th class="vertical-line label">Quantity</th>
          <th class="vertical-line label">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${printContent
        .map(
          (item) => `
    <tr class="bg-gray-100">
      <td class="value">${item.menuName}</td>
      <td class="vertical-line value">${item.quantity}</td>
      <td class="vertical-line value">${item.total}</td> <!-- Corrected property name -->
    </tr>
  `

        )
        .join('')}
      </tbody>
      ${tfootContent}
    </table>
  </div>
  </body>
  </html>
`;



    const printWindow = window.open("", "_self");

    if (!printWindow) {
      alert("Please allow pop-ups to print the report.");
      return;
    }

    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };



  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 p-2 bg-white rounded-md shadow-md font-sans overflow-x-auto">
        <h2 className="text-xl font-bold mb-4 mt-2 text-orange-500">Sold Menu Report</h2>
        <div className="mb-4 lg:flex md:flex items-center">
          <label className="mr-2 mb-2 text-gray-600">Start Date:</label>
          <input
            type="date"
            className="mb-2 mr-2 w-md md:w-auto border rounded-md p-1 text-gray-700 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <div>
            <label className="mr-2 mb-2 text-gray-600">End Date:</label>
            <input
              type="date"
              className="mb-2 mr-2 w-md md:w-auto border rounded-md p-1 text-gray-700 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="text-orange-600 ml-0 lg:ml-4 font-bold py-1 rounded-full text-sm bg-orange-100 mr-2 px-2 shadow-md"
            onClick={exportToExcel}
          >
            Export to Excel
          </button>
          <button
            className="text-green-600 ml-0 lg:ml-4 font-bold py-1 rounded-full text-sm bg-green-200 mr-2 px-4 shadow-md"
            onClick={printReport}
          >
            Print
          </button>
        </div>
        <div className="overflow-x-auto max-w-full">
          <table className="w-full border border-gray-300 text-center">
            <thead className="text-sm bg-zinc-100 text-yellow-700 border">
              <tr className="bg-gray-200 text-center">
                <th className="py-1 px-4 border whitespace-nowrap">SR No.</th>
                <th className="py-1 px-4 border whitespace-nowrap">Menu Name</th>
                <th className="py-1 px-4 border whitespace-nowrap">Quantity</th>
                <th className="py-1 px-4 border whitespace-nowrap">Total Amount</th>
              </tr>
            </thead>
            
            <tbody className='text-sm'>
              {Object.keys(menuStatistics)
                .sort((menu1, menu2) => menuStatistics[menu2].totalPrice - menuStatistics[menu1].totalPrice)
                .map((menu, index) => (
                  <tr key={index}>
                    <td className="py-1 px-4 border">{index + 1}</td>
                    <td className="py-1 px-4 border">{menu}</td>
                    <td className="py-1 px-4 border">{menuStatistics[menu].totalQuantity}</td>
                    <td className="py-1 px-4 border">{menuStatistics[menu].totalPrice}</td>
                  </tr>
                ))}
            </tbody>


            <tfoot>
              <tr className='font-sans text-sm'>
                <td className="py-2 px-4 border"></td>
                <td className="py-2 px-4 border"></td>
                <td className="py-2 px-4 border font-semibold whitespace-nowrap">Total Quantity : {totalQuantity}</td>
                <td className="py-2 px-4 border font-semibold">Total : {totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

export default MenuStatisticsComponent;