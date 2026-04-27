import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  Operational: "#0d6efd",
  Breakdown: "#dc3545",
  Testing: "#ffc107",
  Hired: "#198754",
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const DistroStatusChart = () => {
  const [summary, setSummary] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [distroList, setDistroList] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===========================
     Load Status Summary
  =========================== */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/distro/status-summary/");
        const data = res.data;

        const transformed = Object.keys(data).map((status) => ({
          name: status,
          value: data[status],
        }));

        setSummary(transformed);
      } catch (err) {
        console.error("Failed to load distro summary", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  /* ===========================
     Load distros by status
  =========================== */
  const fetchDistrosByStatus = async (status) => {
    try {
      setSelectedStatus(status);
      const res = await axiosInstance.get(
        `/distro/distros/?status=${encodeURIComponent(status)}`
      );
      setDistroList(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load distros", err);
      setDistroList([]);
    }
  };

  const total = summary.reduce((sum, s) => sum + s.value, 0);

  if (loading) return <p>Loading Distro Summary...</p>;

  return (
    <div className="text-center">
      <h4 className="fw-bold mb-4">📦 Distro Status Overview</h4>

      <div className="d-flex justify-content-center gap-4 flex-wrap">
        {/* PIE */}
        <div style={{ width: 400, height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={summary}
                dataKey="value"
                nameKey="name"
                outerRadius={130}
                label={renderLabel}
                onClick={(e) => fetchDistrosByStatus(e.name)}
              >
                {summary.map((s, i) => (
                  <Cell key={i} fill={COLORS[s.name] || "#8884d8"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TABLE */}
        <div>
          <table className="table table-bordered shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s, i) => (
                <tr
                  key={i}
                  style={{ cursor: "pointer" }}
                  onClick={() => fetchDistrosByStatus(s.name)}
                >
                  <td>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: COLORS[s.name] || "#8884d8",
                        display: "inline-block",
                        marginRight: 8,
                      }}
                    />
                    {s.name}
                  </td>
                  <td>{s.value}</td>
                </tr>
              ))}
              <tr className="table-secondary fw-bold">
                <td>Total</td>
                <td>{total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* DISTRO LIST */}
      {selectedStatus && (
        <div className="mt-5">
          <h5 className="fw-bold">
            Distros with status: {selectedStatus}
          </h5>

          {distroList.length === 0 ? (
            <p>No distros found</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Distro ID</th>
                  <th>Serial No</th>
                  <th>Given Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {distroList.map((d) => (
                  <tr key={d.id}>
                    <td>{d.distro_id}</td>
                    <td>{d.serial_no}</td>
                    <td>{d.given_name}</td>
                    <td>{d.distro_status?.distro_status_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default DistroStatusChart;
