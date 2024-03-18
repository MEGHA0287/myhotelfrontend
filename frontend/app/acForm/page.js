'use client'

// ACForm.js
import { useState, useEffect } from 'react';
import axios from 'axios';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPlus,
//   faTrash,
//   faTimes,
//   faPenToSquare,
// } from "@fortawesome/free-solid-svg-icons";
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';


const ACForm = ({ onSubmit }) => {
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [acPercentage, setACPercentage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('EmployeeAuthToken');
        if (!token) {
            router.push('/login');
        }
    }, []);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/section');
                setSections(response.data);
                if (response.data.length > 0) {
                    setSelectedSection(response.data[0]._id);
                }
            } catch (error) {
                console.error('Error fetching sections:', error.message);
            }
        };

        fetchSections();
    }, []);

    useEffect(() => {
        const fetchACPercentage = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/section/${selectedSection}`);
                setACPercentage(response.data.acPercentage.toString()); // Assuming acPercentage is a number
            } catch (error) {
                console.error('Error fetching AC Percentage:', error.message);
            }
        };

        if (selectedSection) {
            fetchACPercentage();
        }
    }, [selectedSection]);

    const fetchUpdatedSections = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/section');
            setSections(response.data);
        } catch (error) {
            console.error('Error fetching updated sections:', error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSection && acPercentage !== '') {
            try {
                await axios.patch(`http://localhost:5000/api/section/ac/${selectedSection}`, {
                    acPercentage: parseFloat(acPercentage),
                });
                setSuccessMessage('AC Percentage added successfully');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 2000); // Close the success message after 2 seconds
                console.log('AC Percentage added successfully');

                // Fetch and update the list of sections after adding AC Percentage
                fetchUpdatedSections();
            } catch (error) {
                console.error('Error adding AC Percentage:', error.message);
            }
        }
    };

    return (
        <>
            <Navbar />

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto mt-28 shadow-md">
                <div className="text-xl font-bold font-sans md:mb-0 text-orange-600 text-center ">
                    <span>Set AC Percentage</span>
                </div>
                <div className="mb-4 mt-2 relative ml-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sectionSelect">
                        Select Section:
                    </label>
                    <div className="relative mr-4">
                        <select
                           
                            id="sectionSelect"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="block appearance-none border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline lg:w-1/2 w-2/3"
                        >
                            <option value="">Select a section</option>
                            {sections.map((section) => (
                                <option key={section._id} value={section._id}>
                                    {section.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-1/3 ml-10 lg:ml-32 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M10 12L5 7h10l-5 5z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="mb-4 ml-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="acPercentageInput">
                        AC Percentage:
                    </label>
                    <input
                        id="acPercentageInput"
                        type="number"
                        value={acPercentage}
                        onChange={(e) => setACPercentage(e.target.value)}
                        min="0"
                        className="block appearance-none lg:w-1/2 border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="text-center mt-2">
                    {successMessage && (
                        <div className="fixed inset-0 flex items-center justify-center">
                            <div className="bg-white border border-green-500 rounded p-7 shadow-md z-50 absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <p className="text-green-500 font-semibold text-center text-bases">
                                    AC Percentage Added Successfully
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mx-auto mb-3"
                    >
                        Save
                    </button>
                </div>
                  {/* Display the updated list of sections */}
            <div className="overflow-auto max-h-full">
                <table className="min-w-full border-gray-300">
                    <thead className="text-base bg-zinc-100 text-yellow-700 border">
                        <tr>
                            <th className="p-2 text-left text-gray lg:pl-40 pl-4">SR No.</th>
                            <th className="p-2 text-left text-gray lg:pl-40 pl-4">Section Name</th>
                            <th className="p-2 text-left text-gray lg:pl-40 pl-4">AC Percentage</th>
                            {/* <th className="">Actions</th> */}
                            {/* Add more headers based on your data */}
                        </tr>
                    </thead>
                    <tbody className="text-md font-sans font-semibold text-sm">
                        {sections.map((section, index) => (
                            <tr
                                key={section._id}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}
                            >
                                <td className="p-1 text-left text-gray lg:pl-40 pl-4">{index + 1}</td>
                                <td className="p-1 text-left text-gray lg:pl-40 pl-4">{section.name}</td>
                                <td className="p-1 text-left text-gray lg:pl-40 pl-4">{section.acPercentage}</td>
                                <td className=" p-0.5 text-center">
                    
                    {/* <button
                      onClick={() => handleDelete(item._id)}
                      className="text-gray-600 mr-3 font-sans focus:outline-none font-medium p-1 rounded-full px-2 text-sm shadow-md"
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        color="red"
                        className="cursor-pointer"
                      />{" "}
                    </button> */}
                  </td>
                                {/* Add more cells based on your data */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </form>
          

        </>
    );
};

export default ACForm;