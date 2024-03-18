
'use client'

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import Navbar from "../components/Navbar";
import Image from "next/image";
import PaymentModal from "../payment/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

const Try = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [tables, setTables] = useState([]);
  const [sections, setSections] = useState([]);
  const [bills, setBills] = useState({});
  const [displayedTables, setDisplayedTables] = useState([]);
  const [defaultSectionId, setDefaultSectionId] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableInfo, setTableInfo] = useState({ tableName: "", totalAmount: 0 });
  const [orderID, setOrderID] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [tablesInUseCount, setTablesInUseCount] = useState(0);
  const [inputTableNumber, setInputTableNumber] = useState(""); // New state for the input
  const inputRef = useRef(null); // Ref to hold the input element reference
  const [timeoutId, setTimeoutId] = useState(null);
  const [items, setItems] = useState([]);

  const router = useRouter()

  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);


  const handleOpenTable = () => {
    clearTimeout(timeoutId); // Clear the timeout when Enter is pressed
    const foundTable = tables.find((table) => table.tableName === inputTableNumber && table.section._id === selectedSection);

    if (foundTable) {
      if (bills[foundTable._id]?.isTemporary && bills[foundTable._id]?.isPrint === 1) {
        handlePaymentModalOpen(foundTable);
      } else {
        window.location.href = `/order/${foundTable._id}`;
      }
    } else {
      console.log(`Table with name ${inputTableNumber} not found in the selected section.`);
    }
  };



  const handleSectionRadioChange = (sectionId) => {
    setSelectedSection((prevSection) =>
      prevSection === sectionId ? null : sectionId
    );
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionsResponse = await axios.get(
          "http://localhost:5000/api/section"
        );
        setSections(sectionsResponse.data);

        const tablesResponse = await axios.get(
          "http://localhost:5000/api/table/tables"
        );
        setTables(tablesResponse.data);

        const defaultSection = sectionsResponse.data.find(
          (section) => section.isDefault
        );
        if (defaultSection) {
          setDefaultSectionId(defaultSection._id);
          setSelectedSection(defaultSection._id);
        }

        const billsData = await Promise.all(
          tablesResponse.data.map(async (table) => {
            const billsResponse = await axios.get(
              `http://localhost:5000/api/order/order/${table._id}`
            );

            const temporaryBills = billsResponse.data.filter(
              (bill) => bill.isTemporary
            );
            const latestBill =
              temporaryBills.length > 0 ? temporaryBills[0] : null;

            return { [table._id]: latestBill };
          })
        );

        const mergedBills = Object.assign({}, ...billsData);
        setBills(mergedBills);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Remove dependencies to fetch data once on component mount

  useEffect(() => {
    const updateDisplayedTables = () => {
      if (selectedSection) {
        const filteredTables = tables.filter(
          (table) => table.section._id === selectedSection
        );
        setDisplayedTables(filteredTables);
      } else if (defaultSectionId) {
        const defaultTables = tables.filter(
          (table) => table.section._id === defaultSectionId
        );
        setDisplayedTables(defaultTables);
      } else {
        setDisplayedTables([]);
      }
    };

    updateDisplayedTables();
  }, [selectedSection, defaultSectionId, tables]);

  const handlePaymentModalOpen = (table) => {
    setSelectedTable(table);
    const totalAmount = bills[table._id]?.total || 0;
    const items = bills[table._id]?.items || []; // Extract items data
    setTableInfo({
      tableName: table.tableName,
      totalAmount: totalAmount,
    });

    setOrderID(bills[table._id]?._id);
    setOrderNumber(bills[table._id]?.orderNumber);
    setIsPaymentModalOpen(true);
    setItems(items); // Set the items state
  };


  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedTable(null);
    setTableInfo({ tableName: "", totalAmount: 0 });
    setOrderID(null);
  };

  useEffect(() => {
    // Count the tables in use
    const countTablesInUse = () => {
      const inUseCount = displayedTables.reduce((count, table) => {
        return count + (bills[table._id] ? 1 : 0);
      }, 0);
      setTablesInUseCount(inUseCount);
    };

    countTablesInUse();
  }, [displayedTables, bills]);

  useEffect(() => {
    // Set a timeout to clear the input field after 2 seconds
    const timeout = setTimeout(() => {
      setInputTableNumber("");
    }, 2000);

    // Save the timeout ID to clear it if Enter is pressed
    setTimeoutId(timeout);

    // Clear the timeout on component unmount
    return () => {
      clearTimeout(timeout);
    };
  }, [inputTableNumber]);

  return (
    <div>
      {/* <Navbar /> */}
      <div className="container mx-auto px-3 md:px-1 lg:px-1 xl:px-1 justify-around font-sans mt-3">
        <div>
          <ul className="grid grid-cols-5 whitespace-nowrap lg:-mt-4 md:-mt-5 -mt-5  sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-6 gap-32 lg:gap-36 md:gap-32 custom-scrollbars overflow-x-auto">
            {sections.map((section) => (
              <li
                key={section._id}
                className="mb-4 md:mb-2 lg:mb-1 p-1 rounded-2xl px-2 shadow-md hover:bg-slate-100 lg:w-32 w-28"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-1 w-1 bg-blue-100 text-blue-500 rounded-full shadow-inner flex items-center justify-center"></div>
                  <input
                    className="cursor-pointer ml-2"
                    type="radio"
                    id={section._id}
                    name="section"
                    checked={selectedSection === section._id}
                    onChange={() => handleSectionRadioChange(section._id)}
                  />
                  <label
                    className="cursor-pointer font-semibold block md:inline-block p-1 text-gray-600 text-xs"
                    htmlFor={section._id}
                  >
                    {section.name}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* <div className="mt-4 text-center">
          <p>Tables in use: {tablesInUseCount}</p>
        </div> */}
        <div className="mt-4 text-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter table number"
            value={inputTableNumber}
            onChange={(event) => setInputTableNumber(event.target.value)}
            className="sr-only"
          // className="opacity-1"

          />
        </div>
        <div className="flex -mt-2 gap-4 custom-scrollbars overflow-x-auto mb-2">
          {displayedTables.map((table) => (
            <div key={table._id}>
              {/* <h3 className="text-xs md:text-xs lg:text-xs font-semibold -mt-3">
                {table.tableName}
              </h3> */}
              <div
                className={`bg-white cursor-pointer mb-2 p-2 rounded-md border-2 
                ${bills[table._id]?.isTemporary
                    ? bills[table._id]?.isPrint === 1
                      ? "border-blue-600"
                      : "border-orange-400"
                    : "border-gray-500"
                  } w-16 h-12 `}
                onClick={() => {
                  if (
                    bills[table._id]?.isTemporary &&
                    bills[table._id]?.isPrint === 1
                  ) {
                    handlePaymentModalOpen(table);
                  } else {
                    window.location.href = `/order/${table._id}`;
                  }
                }}
              >
                <div className="text-xs md:text-xs lg:text-sm font-semibold -mt-2">
                  {table.tableName}
                </div>
                  
                  <div className="flex justify-center items-center text-center -mt-1">
                    <Image
                      src="/plate.png"
                      alt="logo"
                      height={20}
                      width={20}
                    />
                  </div>
              </div>
            </div>
          ))}
          {isPaymentModalOpen && (
            <PaymentModal
              onClose={handlePaymentModalClose}
              tableName={tableInfo.tableName}
              totalAmount={tableInfo.totalAmount}
              orderID={orderID}
              orderNumber={orderNumber}
              items={items}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Try;