"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { decode } from 'jsonwebtoken';


const PurchaseReport = () => {
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]); // State for vendors
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [mainGrandTotal, setMainGrandTotal] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalGrandTotal, setTotalGrandTotal] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchBillNumber, setSearchBillNumber] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(""); //
  const [filteredPaidAmount, setFilteredPaidAmount] = useState(0); // Add this state
  const [mergedValues, setMergedValues] = useState({});




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
    // Call the handleSearch function whenever startDate or endDate changes
    handleSearch();
  }, [startDate, endDate]);

  useEffect(() => {
    const paidAmounts = filteredPurchases.map((purchase) =>
      parseFloat(purchase.paidAmount || 0)
    );
    const filteredPaidAmount = paidAmounts.reduce(
      (acc, paidAmount) => acc + paidAmount,
      0
    );
    setFilteredPaidAmount(filteredPaidAmount);
  }, [filteredPurchases])




  const handleSearch = () => {
    const filteredByOtherCriteria = purchases.filter((purchase) =>
      purchase.billNo.includes(searchBillNumber)
    );

    // Filter by selected vendor
    const filteredByVendor = selectedVendor
      ? filteredByOtherCriteria.filter(
        (purchase) =>
          purchase.vendorName.toLowerCase() === selectedVendor.toLowerCase()
      )
      : filteredByOtherCriteria;

    const filteredByDate = filteredByVendor.filter((purchase) => {
      const paymentDate = new Date(purchase.date).toISOString().split("T")[0];
      const start = startDate || "01-01-0000";
      const end = endDate || "31-12-9999";
      return paymentDate >= start && paymentDate <= end;


    });

    setFilteredPurchases(filteredByDate);
  };


  const handleReset = () => {
    // Function to get the formatted date
    const getFormattedDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };
  
    // Set the default values for startDate and endDate as the current date
    const defaultDate = getFormattedDate(new Date());
  
    // Reset to default values
    setStartDate(defaultDate);
    setEndDate(defaultDate);
    setSearchBillNumber("");
    setFilteredPurchases(purchases);
  };
  




  
  // const handleReset = () => {
  //   // Function to get the formatted date
  //   const getFormattedDate = (dateString) => {
  //     const date = new Date(dateString);
  //     const day = String(date.getDate()).padStart(2, "0");
  //     const month = String(date.getMonth() + 1).padStart(2, "0");
  //     const year = date.getFullYear();
  //     return `${day}/${month}/${year}`;
  //   };


  //   // Set the default values for startDate and endDate
  //   const defaultStartDate = getFormattedDate(new Date());
  //   const defaultEndDate = getFormattedDate(new Date());

  //   // Reset to default values
  //   setStartDate(defaultStartDate);
  //   setEndDate(defaultEndDate);

  //   setSearchBillNumber("");
  //   setFilteredPurchases(purchases);



  // };


  useEffect(() => {
    const totalBalances = filteredPurchases.map((purchase) =>
      parseFloat(purchase.balance || 0)
    );
    const totalBalance = totalBalances.reduce(
      (acc, balance) => acc + balance,
      0
    );
    setTotalBalance(totalBalance);
  }, [filteredPurchases]);

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const initializeData = () => {
    // Set initial values for startDate and endDate as the current date
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
    setStartDate(formattedDate);
    setEndDate(formattedDate);

    // Trigger a search with the current date
    handleSearch();
  };

  useEffect(() => {
    // Call the initializeData function before fetching data
    initializeData();

    const fetchData = async () => {
      try {
        const purchasesResponse = await axios.get("http://localhost:5000/api/purchase/purchases");
        setPurchases(purchasesResponse.data);
        console.log(purchasesResponse.data)
        setFilteredPurchases(purchasesResponse.data);

        const itemsResponse = await axios.get("http://localhost:5000/api/item/items");
        setItems(itemsResponse.data);

        const vendorsResponse = await axios.get("http://localhost:5000/api/supplier/suppliers");
        setVendors(vendorsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    setMainGrandTotal(calculateMainGrandTotal());
  }, [filteredPurchases]);

  useEffect(() => {
    const grandTotals = purchases.map((purchase) =>
      parseFloat(calculateGrandTotal(purchase))
    );
    const totalGrandTotal = grandTotals.reduce(
      (acc, grandTotal) => acc + grandTotal,
      0
    );
    setTotalGrandTotal(totalGrandTotal);
  }, [purchases]);

  useEffect(() => {
    const totalBalances = purchases.map((purchase) =>
      parseFloat(purchase.balance || 0)
    );
    const totalBalance = totalBalances.reduce(
      (acc, balance) => acc + balance,
      0
    );
    setTotalBalance(totalBalance);
  }, [purchases]);


  const calculateGrandTotal = (item) => {
    if (item) {
      const grandTotal = item.quantity * item.pricePerQty;
      return grandTotal.toFixed(2);
    }
    return "00.00";
  };



  const calculateMainGrandTotal = () => {
    const grandTotals = filteredPurchases.map((purchase) =>
      purchase.items.reduce((acc, item) => {
        const itemTotal = item.quantity * item.pricePerQty;
        return acc + itemTotal;
      }, 0)
    );
    return grandTotals.reduce((acc, grandTotal) => acc + grandTotal, 0);
  };


  useEffect(() => {
    const grandTotals = purchases.map((purchase) =>
      parseFloat(calculateGrandTotal(purchase))
    );
    const totalGrandTotal = grandTotals.reduce(
      (acc, grandTotal) => acc + grandTotal,
      0
    );
    setTotalGrandTotal(totalGrandTotal);
  }, [purchases]);

  useEffect(() => {
    const totalBalances = purchases.map((purchase) =>
      parseFloat(purchase.balance || 0)
    );
    const totalBalance = totalBalances.reduce(
      (acc, balance) => acc + balance,
      0
    );
    setTotalBalance(totalBalance);
  }, [purchases]);

  const handleExportToExcel = () => {
    // Format the data for Excel export
    const formattedPurchases = filteredPurchases.map((purchase, index) => ({
      "SR No": index + 1,
      "Bill No": purchase.billNo,
      Date: purchase.date,
      "Item Name": purchase.items.map((item) => item.productName).join(", "),
      QTY: purchase.items.reduce((qty, item) => qty + item.quantity, 0),
      Unit: purchase.items.map((item) => item.unit).join(", "),
      Subtotal: purchase.subtotal.toFixed(2),
      Discount: purchase.discount.toFixed(2),
      GST: purchase.gst.toFixed(2),
      "GST Amount": purchase.gstAmount.toFixed(2),
      "Paid Amount": purchase.paidAmount.toFixed(2),
      "Grand Total": calculateGrandTotal(purchase),
      Balance: purchase.balance.toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(formattedPurchases);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase_report.xlsx";
    a.click();
  };


  // New useEffect hook to calculate merged values
  useEffect(() => {
    const merged = {};
    filteredPurchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        if (!merged[item.productName]) {
          merged[item.productName] = {
            discount: purchase.discount || 0,
            paidAmount: purchase.paidAmount || 0,
            balance: purchase.balance || 0,
          };
        } else {
          merged[item.productName].discount += purchase.discount || 0;
          merged[item.productName].paidAmount += purchase.paidAmount || 0;
          merged[item.productName].balance += purchase.balance || 0;
        }
      });
    });
    setMergedValues(merged);
  }, [filteredPurchases]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-2 mt-10 font-sans">
        <h1 className="md:text-xl text-md  font-bold mb-4 text-start text-orange-500">
          Vendor Wise Purchase Reports
        </h1>
        <div className="flex flex-wrap items-center mb-4 justify-center text-left ">
          <label className="mr-2 text-gray-600   md:text-base  text-sm">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md p-1 text-gray-700 mb-2 sm:mb-0 md:text-sm text-sm lg:w-md"
          />
          <div>
            <label className="mx-2 text-gray-600 md:text-base text-sm">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-md p-1 text-gray-700 mb-2 sm:mb-0 md:text-sm text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Search Date/Bill"
              value={searchBillNumber}
              onChange={(e) => setSearchBillNumber(e.target.value)}
              className="border rounded-full p-1 text-gray-900 mb-2 sm:mb-0 ml-3 font-semibold md:text-sm text-sm lg:w-48"
            />
          </div>
          <div className="mt-1">
            <button
              className="text-orange-600 font-bold py-1 rounded-lg bg-orange-50 mr-2 px-2 ml-3 md:text-sm text-sm border"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              className="text-orange-600 font-bold py-1 rounded-lg bg-orange-50 mr-2 px-2 md:text-sm text-sm border"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className="text-orange-600 font-bold py-1 rounded-lg bg-orange-50 mr-2 px-2 md:text-sm text-sm border"
              onClick={handleExportToExcel}
            >
              Export to Excel
            </button>
          </div>
        </div>
        <div className=" flex justify-center flex-col">

          {selectedVendor && (
            <p className="text-lg mb-2 md:text-base">
              Showing reports for Vendor: <strong>{selectedVendor}</strong>
            </p>
          )}

          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="border rounded-md p-1 text-gray-700 mb-2 sm:mb-0 w-fit justify-center flex md:text-sm text-sm"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor.vendorName}>
                {vendor.vendorName}
              </option>
            ))}
          </select>
        </div>
        <div className="table-container max-h-[400px] overflow-x-auto max-w-full md:text-base text-sm font-sans">
          <table className="min-w-full bg-white border border-gray-300 text-left align-middle overflow-x-auto overflow-scroll ">
            <thead>
              <tr className=" text-left align-middle bg-gray-200 text-yellow-700 md:text-base text-sm ">
                <th className="py-1 px-4 border-b">Bill No</th>
                <th className="py-1 px-4 border-b">Date</th>
                <th className="py-1 px-4 border-b">Item Name</th>
                <th className="py-1 px-4 border-b">QTY</th>
                <th className="py-1 px-4 border-b">Unit</th>
                <th className="py-1 px-4 border-b">Price/Unit</th>
                <th className="py-1 px-4 border-b">GST Amt</th>
                <th className="py-1 px-4 border-b">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredPurchases.length > 0 && (
                <>
                  {filteredPurchases.map((purchase, index) => (
                    <React.Fragment key={purchase._id}>
                      {purchase.items.map((item, itemIndex) => (
                        <tr key={`${purchase._id}-${itemIndex}`} className="hover:bg-gray-100">
                          <td className="py-1 px-4 border-b font-bold">
                            {itemIndex === 0 ? purchase.billNo : ""}
                          </td>
                          <td className="py-1 px-4 border-b">
                            {itemIndex === 0 ? getFormattedDate(purchase.date) : ""}
                          </td>
                          <td className="py-1 px-4 border-b">{item.productName}</td>

                          <td className="py-1 px-4 border-b">{item.quantity}</td>
                          <td className="py-1 px-4 border-b">{item.unit}</td>
                          <td className="py-1 px-4 border-b">{item.pricePerQty} Rs.</td>
                          <td className="py-1 px-4 border-b">{item.gstAmount}</td>
                          <td className="py-1 px-4 border-b">{item.quantity * item.pricePerQty}</td>
                        </tr>
                      ))}
                      <tr className="mb-5">
                        <td className="py-2 px-4 border-b mb-5" colSpan="4"></td>
                        <td className="py-3 px-4 border-2 font-bold bg-gray-100">Discount: {purchase.discount ? purchase.discount.toFixed(2).padStart(5, "0") : "00.00"}</td>
                        <td className="py-3 px-4 border-2 font-bold bg-gray-100">Paid Amount: {purchase.paidAmount ? purchase.paidAmount.toFixed(2).padStart(5, "0") : "00.00"}</td>
                        <td className="py-3 px-4 border-2 font-bold bg-gray-100 text-red-500">Balance: {purchase.balance ? purchase.balance.toFixed(2).padStart(5, "0") : "00.00"}</td>
                        <td className="py-3 px-4 border-2 font-bold bg-gray-100 text-green-500">total: {purchase.subtotal ? purchase.subtotal.toFixed(2).padStart(5, "0") : "00.00"}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-2 sm:float-right border p-4 flex md:text-sm text-sm font-bold">
          <h2 className="">Grand Total : </h2>
          <p className=" font-bold text-green-600">{mainGrandTotal.toFixed(2)}</p>
        </div>
        <div className="mt-2 sm:float-right border p-4 flex s text-red-500 md:text-sm text-sm font-sans font-bold">
          <h2 className="text-black">
            {selectedVendor ? `${selectedVendor} ` : "All Vendors "}Balance :
          </h2>
          <p className="font-bold ml-2">{totalBalance.toFixed(2)}</p>
        </div>

        <div className="mt-2 sm:float-right border p-4 flex s text-green-500 md:text-sm text-sm font-bold">
          <h2 className="text-black">
            {selectedVendor ? `${selectedVendor}` : "Total"} Paid Amount :
          </h2>
          <p className="font-bold ml-2">{filteredPaidAmount.toFixed(2)}</p>
        </div>
      </div>
    </>
  );
};

export default PurchaseReport;