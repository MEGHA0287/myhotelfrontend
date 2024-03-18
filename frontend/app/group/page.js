"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faTrash,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";


const GroupMenu = () => {
  const [mainCategories, setMainCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAddMenus, setSelectedAddMenus] = useState([]);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isNoMenuSelectedModalOpen, setIsNoMenuSelectedModalOpen] =
    useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [menuCounts, setMenuCounts] = useState({});

  const router = useRouter();
  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  let closeTimeout;

  const handleAddMenusToCategory = async () => {
    try {
      setLoading(true);

      if (selectedAddMenus.length === 0) {
        setIsNoMenuSelectedModalOpen(true);
        setLoading(false);
        setTimeout(() => {
          setIsNoMenuSelectedModalOpen(false); // Close the modal after 2 seconds
        }, 2000);
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/menu/${selectedMainCategory}/assignmenus`,
        {
          menuIds: selectedAddMenus,
        }
      );

      console.log(response.data);

      await fetchMenusForCategory();

      setSelectedAddMenus([]);
      setLoading(false);
      setIsSuccessModalOpen(true);
      closeTimeout = setTimeout(() => {
        setIsSuccessModalOpen(false); // Close the success modal after 2 seconds
      }, 2000); // Set the timeout duration to 2000 milliseconds (2 seconds)
    } catch (error) {
      console.error("Error adding menus:", error);
      setError();
      setLoading(false);
      setIsErrorModalOpen(true);

      closeTimeout = setTimeout(() => {
        setIsErrorModalOpen(false);
      }, 2000);
    }
  };

  const closeModal = () => {
    setIsErrorModalOpen(false);
    setIsNoMenuSelectedModalOpen(false);
    setIsSuccessModalOpen(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(closeTimeout);
    };
  }, []);

  const handleMenuCheckboxChange = (menuId) => {
    const updatedSelectedMenus = selectedMenus.includes(menuId)
      ? selectedMenus.filter((id) => id !== menuId)
      : [...selectedMenus, menuId];

    setSelectedMenus(updatedSelectedMenus);

    const isAllSelected = filteredMenus.every((menu) =>
      updatedSelectedMenus.includes(menu._id)
    );

    setSelectAll(isAllSelected);
  };

  const handleSelectAllChange = () => {
    const updatedSelectAll = !selectAll;
    setSelectAll(updatedSelectAll);

    const updatedSelectedMenus = updatedSelectAll
      ? filteredMenus.map((menu) => menu._id)
      : [];

    setSelectedMenus(updatedSelectedMenus);
  };

  const fetchAllMenus = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/menu/menus/list"
      );
      const allMenus = response.data;

      const counts = {};
      allMenus.forEach((menu) => {
        const category = menu.category;
        counts[category] = (counts[category] || 0) + 1;
      });

      setMenuCounts(counts);
      setMenus(allMenus);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  useEffect(() => {
    fetchAllMenus();
  }, []);

  useEffect(() => {
    fetchAllMenus();
  }, []);

  const handleAddMenuCheckboxChange = (menuId) => {
    const isSelected = selectedAddMenus.includes(menuId);

    if (isSelected) {
      setSelectedAddMenus((prevMenus) =>
        prevMenus.filter((menu) => menu !== menuId)
      );
    } else {
      setSelectedAddMenus((prevMenus) => [...prevMenus, menuId]);
    }
  };

  const setErrorWithDuration = (errorMessage, duration) => {
    setError(errorMessage);

    setTimeout(() => {
      clearError();
    }, duration);
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const mainCategoriesResponse = await axios.get(
          "http://localhost:5000/api/main"
        );
        setMainCategories(mainCategoriesResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data from the server");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchMenusForCategory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/main/${selectedMainCategory}`
      );
      const mainCategory = response.data;

      if (!mainCategory) {
        console.error("Main category not found");
        return;
      }

      setFilteredMenus(mainCategory.menus || []);
    } catch (error) {
      console.error("Error fetching menus for the selected category:", error);
    }
  };

  useEffect(() => {
    if (selectedMainCategory) {
      fetchMenusForCategory();
    }
  }, [selectedMainCategory]);

  const handleDeleteMenus = async () => {
    try {
      setLoading(true);

      const response = await axios.delete(
        `http://localhost:5000/api/menu/${selectedMainCategory}/removemenus`,
        {
          data: { menuIds: selectedMenus },
        }
      );

      console.log("Menus deletion successful:", response.data);

      await fetchMenusForCategory();

      setSelectedMenus([]);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting menus:", error);
      setError("Error deleting menus");
      setLoading(false);
    }
  };

  const home = () => {
    router.push("/dashboard");
  };

  const filteredMenusForAdd = menus.filter((menu) =>
    menu.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="container justify-center text-lg mt-1 font-sans font-semibold mx-auto p-5 overflow-x-auto border-gray-300 border-1 max-full"></div>
      <div>
        <div className=" bg-black font-sans">
        {isErrorModalOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 font-sans"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
  >
    <div className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg">
      <div className="text-center">
        <h3 className="mb-5 text-lg font-semibold text-red-600 dark:text-red-400">
        Menus are already added!
        </h3>
      </div>
    </div>
  </div>
)}
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-2 p-4 rounded-md flex flex-col md:flex-row bg-gray-50 font-sans">
        <div className="w-full md:w-1/2 pr-4 mb-4 md:mb-0">
          <h1 className="text-xl font-bold font-sans mb-2 md:mb-0 text-orange-600">
            Group Menus
          </h1>
          <div className="mb-4">
            <label
              htmlFor="mainCategory"
              className="block text-gray-700 text-sm font-bold mb-2 mt-2"
            >
              Select Main Category:
            </label>
            <select
              id="mainCategory"
              name="mainCategory"
              value={selectedMainCategory}
              onChange={(e) => setSelectedMainCategory(e.target.value)}
              className="mt-1 p-2 w-1/2 border text-sm bg-white rounded-xl focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="" disabled>
                Select Main Category
              </option>
              {mainCategories.map((mainCategory) => (
                <option key={mainCategory._id} value={mainCategory._id}>
                  {mainCategory.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 overflow-y-auto max-h-96">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Selected Category:
            </label>
            {loading ? (
              <p>Loading menus...</p>
            ) : (
              <>
                <div className="flex items-center mb-2 w-full ">
                  <input
                    type="checkbox"
                    id="select-all"
                    onChange={handleSelectAllChange}
                    checked={selectAll}
                    className="mr-2 checkbox text-sm mt-1"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-gray-800 text-sm font-bold"
                  >
                    Select All Menus
                  </label>
                </div>
                {filteredMenus.map((menu) => (
                  <div key={menu._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`category-menu-${menu._id}`}
                      onChange={() => handleMenuCheckboxChange(menu._id)}
                      checked={selectedMenus.includes(menu._id)}
                      className="mr-2 checkbox text-sm mt-1"
                    />
                    <label className="text-gray-800 text-sm">{menu.name}</label>
                  </div>
                ))}
              </>
            )}
            {filteredMenus.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteMenus}
                className="bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 px-4 rounded-full w-72 mx-auto mt-4"
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  className="cursor-pointer mr-2 text-sm"
                />
                Delete Selected Menus
              </button>
            )}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="w-full md:w-1/2 ml-0 md:ml-4">
          <div className="flex flex-col md:flex-row">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Menus to Add:
            </label>
            <div className="ml-2 text-sm">
              {Object.keys(menuCounts).map((category) => (
                <p key={category}>Total Menus: {menuCounts[category]}</p>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap">
            <input
              type="text"
              placeholder="Search menus..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="w-full p-2 border mb-4 text-sm rounded-xl focus:outline-none focus:ring focus:border-blue-300"
            />
            <div
              className="custom-scrollbars overflow-y-auto force-overflow h-96 w-full scrollbar"
              id="style-4"
            >
              {loading ? (
                <p>Loading menus...</p>
              ) : (
                <>
                  <div className="flex flex-wrap">
                    {filteredMenusForAdd
                      .slice(0, Math.ceil(filteredMenusForAdd.length))
                      .map((menu) => (
                        <div
                          key={menu._id}
                          className="flex items-center w-1/2 sm:w-1/2 md:w-1/2 lg:w-1/2 mt-2"
                        >
                          <input
                            type="checkbox"
                            id={`add-menu-${menu._id}`}
                            onChange={() =>
                              handleAddMenuCheckboxChange(menu._id)
                            }
                            checked={selectedAddMenus.includes(menu._id)}
                            className="mr-2 checkbox text-sm mt-1"
                          />
                          <label
                            htmlFor={`add-menu-${menu._id}`}
                            className="text-sm text-gray-800"
                          >
                            {menu.name}
                          </label>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            {menus.length > 0 && (
              <button
                type="button"
                onClick={handleAddMenusToCategory}
                className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mx-auto mt-4"
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className="cursor-pointer mr-2 text-sm"
                />
                Add Selected Menus
              </button>
            )}
          </div>
        </div>
      </div>
      {/* No Menu Selected Modal */}
      {isNoMenuSelectedModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 font-sans"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg">
            <div className="text-center">
              <h3 className="mb-5 text-lg font-semibold text-red-600 dark:text-red-400">
                Please select menus to add!
              </h3>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 font-sans"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg">
            <div className="text-center">
              <h3 className="mb-5 text-lg font-semibold text-green-600 dark:text-green-400">
               Menu Added Successfully
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupMenu;