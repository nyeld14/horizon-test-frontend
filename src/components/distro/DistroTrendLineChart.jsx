import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../../api/axiosInstance";
import dayjs from "dayjs";

const STATUS_OPTIONS = [
  "Operational(Ready to Hire)",
  "Breakdown",
  "Testing",
  "Hired",
];

const COLORS = {
  Breakdown: "#FF0000",
  Testing: "#FFA500",
  "Operational(Ready to Hire)": "#0d6efd",
  Hired: "#198754",
};

const DistroTrendLineChart = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = dayjs().format("YYYY-MM-DD");
  const [dateRange, setDateRange] = useState("7days");
  const [startDate, setStartDate] = useState(dayjs().subtract(6, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(today);

  const [activeStatuses, setActiveStatuses] = useState(STATUS_OPTIONS);

  /* ===============================
     Date Range
  =============================== */
  useEffect(() => {
    const end = dayjs();
    let start = end;

    if (dateRange === "7days") start = end.subtract(6, "day");
    else if (dateRange === "14days") start = end.subtract(13, "day");
    else if (dateRange === "30days") start = end.subtract(29, "day");
    else if (dateRange === "90days") start = end.subtract(89, "day");
    else if (dateRange === "180days") start = end.subtract(179, "day");
    else if (dateRange === "today") start = end;

    setStartDate(start.format("YYYY-MM-DD"));
    setEndDate(end.format("YYYY-MM-DD"));
  }, [dateRange]);

  /* ===============================
     Fetch Trend Data
  =============================== */
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        setError("");

        const url = `/distro/status-trend/?start_date=${startDate}&end_date=${endDate}`;
        const res = await axiosInstance.get(url);

        setTrendData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch distro trend:", err);
        setError("Failed to load data from server.");
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [startDate, endDate]);

  const formatXAxisLabel = (value) => dayjs(value).format("DD MMM");

  return (
    <div className="p-4 text-center">
      <h4 className="fw-bold mb-4" style={{ marginTop: "40px" }}>
        📦 Distro Utilization ({startDate} → {endDate})
      </h4>

      {/* Date Range */}
      <div className="d-flex justify-content-center gap-3 mb-3 flex-wrap">
        <label className="fw-semibold me-2">Range:</label>
        <select
          className="form-select d-inline-block w-auto"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="14days">Last 14 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="180days">Last 180 Days</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateRange === "custom" && (
          <>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </>
        )}
      </div>

      {/* Status Toggles */}
      <div className="d-flex justify-content-center flex-wrap gap-4 mb-4">
        {STATUS_OPTIONS.map((status) => (
          <label key={status} className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={activeStatuses.includes(status)}
              onChange={() =>
                setActiveStatuses((prev) =>
                  prev.includes(status)
                    ? prev.filter((s) => s !== status)
                    : [...prev, status]
                )
              }
            />
            <span style={{ color: COLORS[status], fontWeight: 600 }}>{status}</span>
          </label>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <p>Loading distro trend data…</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : trendData.length === 0 ? (
        <p className="text-muted">No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={trendData}>
            <CartesianGrid stroke="#dee2e6" strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Legend />

            {activeStatuses.map(
              (status) =>
                trendData.some((d) => d[status] !== undefined) && (
                  <Line
                    key={status}
                    type="monotone"
                    dataKey={status}
                    stroke={COLORS[status]}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DistroTrendLineChart;
