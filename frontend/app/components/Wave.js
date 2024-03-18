
'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";

function Wave() {
  const [totalAmountsByMonth, setTotalAmountsByMonth] = useState([]);
  const [expensesAmountsByMonth, setExpensesAmountsByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const totalResponse = await axios.get(
          "http://localhost:5000/api/order/total-amounts-by-month"
        );
        const expensesResponse = await axios.get(
          "http://localhost:5000/api/expense/expenses-amounts-by-month"
        );

        setTotalAmountsByMonth(totalResponse.data.totalAmountsByMonth);
        setExpensesAmountsByMonth(expensesResponse.data.expensesAmountsByMonth);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);


// Move the months declaration after fetching data
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];

const totalAmounts = totalAmountsByMonth.map((entry) => Math.round(entry.totalAmount));
const expensesAmounts = expensesAmountsByMonth.map((entry) => Math.round(entry.totalAmount));

  const seriesData = [
    {
      name: "Total Sales",
      data: totalAmounts,
    },
    {
      name: "Total Expenses",
      data: expensesAmounts,
    },
  ];

 

  return (
    <React.Fragment>
      <div className="container-fluid rounded-md">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Chart
            type="area"
            width="100%"
            height={300}
            series={seriesData}
            options={{
              title: {
                text: "Financial",
                style: { fontSize: 20 },
              },
              stroke: { width: 1, curve: "smooth" },
              xaxis: {
                title: { text: "", style: { fontSize: 20 } },
                categories: months,
              },
              yaxis: {
                title: {
                  style: { fontSize: 20 },
                },
              },
              responsive: [
                {
                  breakpoint: 768,
                  options: {
                    legend: {
                      position: "bottom",
                    },
                  },
                },
              ],
            }}
          />
        )}
      </div>
    </React.Fragment>
  );
}

export default Wave;

