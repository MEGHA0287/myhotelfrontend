'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';
import { decode } from 'jsonwebtoken';


const StockOutwardTable = () => {
  const [stockOutwardList, setStockOutwardList] = useState([]);
  const [stockReports, setStockReports] = useState([]);
  const [startDate, setStartDate] = useState(getFormattedDate(new Date())); // Default to today's date
  const [endDate, setEndDate] = useState(getFormattedDate(new Date())); // Default to today's date
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);

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


  const fetchStockOutwardList = async (start, end) => {
    try {
      const response = await axios.get('http://localhost:5000/api/stockOut/stockOut', {
        params: {
          startDate: start,
          endDate: end,
        },
      });
      console.log(response.data)
      setStockOutwardList(response.data);
    } catch (error) {
      console.error('Error fetching stock outward list:', error.response ? error.response.data : error.message);
    }
  };

  const fetchStockReports = async () => {
    try {
      const formattedStartDate = getFormattedDate(new Date(startDate));
      const formattedEndDate = getFormattedDate(new Date(endDate));

      const response = await axios.get('http://localhost:5000/api/stockOut/stockOut', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

      setStockReports(response.data);
    } catch (error) {
      console.error('Error fetching stock reports:', error.response ? error.response.data : error.message);
    }
  };



  useEffect(() => {
    fetchStockOutwardList(startDate, endDate);
    fetchStockReports();
  }, [startDate, endDate]); // Update when the dates change

  const filteredStockOutwardList = stockOutwardList.filter((entry) =>
    entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.waiterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const handleSearch = () => {
  //   // Call the fetch functions with the selected date range
  //   fetchStockOutwardList(startDate, endDate);
  //   fetchStockReports();
  // };
  // const handleSearchButtonClick = () => {
  //   fetchStockOutwardList(startDate, endDate);
  //   fetchStockReports();
  //   console.log("Performing search for:", searchTerm);
  //   // Add your search functionality here
  // };

  const exportToExcel = () => {
    const filteredData = filteredStockOutwardList.map((entry, index) => {
      const stockReport = stockReports.find(
        (report) =>
          report.waiterName === entry.waiterName && report.productName === entry.productName
      );

      const formattedEntryDate = getFormattedDate(new Date(entry.date));
      const isDateInRange = formattedEntryDate >= startDate && formattedEntryDate <= endDate;

      if (isDateInRange) {
        const remainingStock = stockReport
          ? stockReport.stockQty - entry.stockQty
          : '-';
        const totalStock = stockReport ? stockReport.stockQty : '-';

        return {
          'SR No.': index + 1,
          'Waiter Name': entry.waiterName,
          'Product Name': entry.productName,
          'Available Stock': entry.availableQuantity,
          'Stock Taken': entry.stockQty,
          'Remaining Stock': entry.availableQuantity - entry.stockQty,

          Date: new Date(entry.date).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
          }),
        };
      }

      return null;
    }).filter(Boolean); // Remove null or undefined entries

    const ws = XLSX.utils.json_to_sheet(filteredData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StockData');

    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(data, 'StockData.xlsx');
  };

  const handleExportItemsToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(itemList.map(({ itemName, stockQty, price }) => ({ 'Item Name': itemName, 'Remaining Stock': stockQty, 'Price': price })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ItemData');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'ItemData.xlsx');
  };



  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/item/items');
      const itemsWithPrice = await Promise.all(response.data.map(async (item) => {
        const purchaseBillsResponse = await axios.get('http://localhost:5000/api/purchase/purchases', {
          params: {
            itemName: item.itemName
          }
        });
        const purchaseBills = purchaseBillsResponse.data;

        let totalValue = 0;
        let latestPricePerQty = null; // Initialize latest price per quantity to null

        // Iterate over all purchase bills for the current item in reverse chronological order
        for (let i = purchaseBills.length - 1; i >= 0; i--) {
          const bill = purchaseBills[i];
          const billItem = bill.items.find(billItem => billItem.productName === item.itemName);
          if (billItem) {
            if (!latestPricePerQty) {
              latestPricePerQty = billItem; // If latestPricePerQty is null, set it to the current bill item
            } else if (new Date(billItem.date) > new Date(latestPricePerQty.date)) {
              latestPricePerQty = billItem; // Update latest price per quantity if the current bill item is newer
            }
          }
        }

        if (latestPricePerQty) {
          totalValue = item.stockQty * latestPricePerQty.pricePerQty; // Calculate total value using the latest price per quantity
          totalValue = Math.round(totalValue); // Round the total value to the nearest whole number
        }

        return {
          ...item,
          price: totalValue
        };
      }));

      setItemList(itemsWithPrice);
    } catch (error) {
      console.error('Error fetching items:', error.response ? error.response.data : error.message);
    }
  };



  useEffect(() => {
    fetchItems();
  }, []); // Run once on component mount


  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 p-2 bg-white rounded-md shadow-md font-sans">
        <h1 className="text-xl font-bold mb-2">StockOutward Report</h1>
        <div className="mb-4 flex flex-wrap items-center">
          <label className="mr-2 text-gray-600">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md p-1 text-gray-700 text-sm"
          />
          <div>
            <label className=" text-gray-600 lg:ml-2">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-md p-1 text-gray-700 text-sm ml-3 mt-2 lg:mt-0"
            />
            {/* Add any additional elements here */}
          </div>
          <div className="flex flex-wrap justify-between mt-2 lg:mt-0">
            <button
              className="bg-blue-100 text-blue-600 text-sm px-4 py-2 rounded-full font-bold hover:bg-blue-200 focus:outline-none focus:shadow-outline-blue lg:ml-2 md:ml-2"
              onClick={exportToExcel}
            >
              Export to Excel
            </button>
            <button
              className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full lg:ml-2 ml-2 font-bold hover:bg-gray-200 focus:outline-none focus:shadow-outline-gray"
              onClick={handleExportItemsToExcel}
            >
              Export Items
            </button>
          </div>
        </div>
        <div className=' flex flex-col md:flex md:flex-col  lg:flex-row sm:flex-row'>
          <div>
            <div className="w-full overflow-x-auto mb-4 sm:mb-0">
              <table className="border-collapse border border-gray-300 min-w-full divide-y divide-gray-200">
                <thead className="text-sm bg-zinc-100 text-yellow-700 border">
                  <tr>
                    <th className="p-1 border whitespace-nowrap">Sr No.</th>
                    <th className="p-1 border whitespace-nowrap">Date</th>
                    <th className="p-1 border whitespace-nowrap">Waiter Name</th>
                    <th className="p-1 border whitespace-nowrap">Item Name</th>
                    <th className="p-1 border whitespace-nowrap">Available Stock</th>
                    <th className="p-1 border whitespace-nowrap">Stock Taken</th>
                    <th className="p-1 border whitespace-nowrap">Remaining Stock</th>
                  </tr>
                </thead>
                <tbody className='text-sm'>
                  {filteredStockOutwardList.map((entry, index) => {
                    const stockReport = stockReports.find(
                      (report) =>
                        report.waiterName === entry.waiterName && report.productName === entry.productName
                    );

                    const formattedEntryDate = getFormattedDate(new Date(entry.date));
                    const isDateInRange = formattedEntryDate >= startDate && formattedEntryDate <= endDate;

                    if (isDateInRange) {
                      const remainingStock = stockReport
                        ? stockReport.stockQty - entry.stockQty
                        : '-';

                      return (
                        <tr key={index}>
                          <td className="p-1 border text-center">{index + 1}</td>
                          <td className="p-1 border text-center">
                            {new Date(entry.date).toLocaleString('en-GB', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              second: 'numeric',
                              hour12: true,
                            })}
                          </td>
                          <td className="p-3 border text-center">{entry.waiterName}</td>
                          <td className="p-3 border text-center">{entry.productName}</td>
                          <td className="p-3 border text-center">{entry.availableQuantity}</td>
                          <td className="p-3 border text-center">{entry.stockQty}</td>
                          <td className="p-3 border text-center">{entry.availableQuantity - entry.stockQty}</td>

                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* <h1 className="text-xl font-bold mb-3">Item Table</h1> */}
          <div className="mt-4 max-h-64 custom-scrollbars overflow-y-auto lg:ml-20 md:-ml-4 md:mt-4 lg:-mt-1 sm:flex-col">
            <div className="sm:pl-4 mt-2 sm:mt-0 sm:order-1">
              <table className="border-collapse border border-gray-300 sm:w-full">
                <thead className="text-base bg-zinc-100 text-yellow-700 border">
                  <tr>
                    <th className="p-2 border whitespace-nowrap">Item Name</th>
                    <th className="p-2 border whitespace-nowrap">Remaining Stock</th>
                    <th className="p-2 border whitespace-nowrap">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {itemList.map((item) => (
                    <tr key={item.itemId}>
                      <td className="p-1 border text-center">{item.itemName}</td>
                      <td className="p-1 border text-center">{item.stockQty}</td>
                      <td className="p-1 border text-center">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockOutwardTable;

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}