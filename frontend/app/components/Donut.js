'use client'
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

function Donut() {
  const [summaryData, setSummaryData] = useState({
    cashAmount: 0,
    dueAmount: 0,
    onlinePaymentAmount: 0,
    complimentaryAmount: 0,
    discount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/order/summary");
        const data = response.data;

        // Round the values
        data.cashAmount = Math.round(parseFloat(data.cashAmount));
        data.dueAmount = Math.round(parseFloat(data.dueAmount));
        data.onlinePaymentAmount = Math.round(parseFloat(data.onlinePaymentAmount));
        data.complimentaryAmount = Math.round(parseFloat(data.complimentaryAmount));
        data.discount = Math.round(parseFloat(data.discount));

        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="container-fluid rounded-md">
        <Chart
          type="donut"
          width="100%"
          height={400}
          series={[summaryData.cashAmount, summaryData.dueAmount, summaryData.onlinePaymentAmount, summaryData.complimentaryAmount, summaryData.discount]}
          options={{
            title: {
              text: "Transactions",
              style: { fontSize: 20 },

            },
            labels: ["Cash", "Credit", "Online", "Complimentary", "Discount"],
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    align: 'center',
                    total: {
                      show: true,
                      fontSize: '14px',
                      color: "blue",
                      formatter: function (w) {
                        const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                        return isNaN(total) ? "₹0" : "₹" + Math.round(total);
                      }
                    },
                  },
                },
              },
            },
            dataLabels: {
              enabled: false,
            },
            colors: ["#7F00FF", "#40E0D0", "#EA5982", "#FA8072", "#FF7F50"],
          }}
          style={{ cursor: "pointer" }}
        />
      </div>
    </React.Fragment>
  );
}

export default Donut;

