import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  Breakdown: '#FF0000',
  Testing: '#FFA500',
  'Operational(Ready to Hire)': '#0000FF',
  Hired: '#008000',
};

const normalizeStatus = (status) => {
  if (!status) return 'Unknown';
  const s = status.trim().toLowerCase();
  if (s.includes('operational') || s.includes('ready to hire')) return 'Operational(Ready to Hire)';
  if (s.includes('testing')) return 'Testing';
  if (s.includes('breakdown')) return 'Breakdown';
  if (s.includes('hired')) return 'Hired';
  return status;
};


const groupInvertersBy = (list, keyFn) => {
  return list.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const InverterStatusChart = ({ mode = 'employee' }) => {
  const [data, setData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [inverterList, setInverterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleItemClick = (givenStartName, inverter_id) => {
    navigate(
      `/admin-dashboard/add-po?inverter=${encodeURIComponent(givenStartName)}&inverter_id=${encodeURIComponent(inverter_id)}`
    );
  };

  const fetchInvertersByStatus = async (status) => {
  try {
    setSelectedStatus(status);

    let response;

    if (mode === 'admin') {
      
      response = await axiosInstance.get(
        `/inverters/?status=Operational(Ready to Hire)`
      );
      setInverterList(response.data.results || []);
    } else {
      
      const statusMapping = {
        'Operational(Ready to Hire)': ['Operational(Ready to Hire)'],
        'Breakdown': ['Breakdown'],
        'Testing': ['Testing'],
        'Hired': ['Hired'],
      };

      const filterStatuses = statusMapping[status] || [status];
      const query = `status=${filterStatuses.map((s) => encodeURIComponent(s)).join(',')}`;

      response = await axiosInstance.get(`/inverters/?${query}`);
      setInverterList(response.data.results || []);
    }
  } catch (error) {
    console.error('Failed to fetch inverters by status:', error);
    setInverterList([]);
  }
};



  useEffect(() => {
    const fetchSummaryAndDefault = async () => {
      try {
        const response = await axiosInstance.get('/api/inverter-status-summary/');
        const result = response.data;

       
        const transformed = Object.keys(result).reduce((acc, status) => {
          const normalized = normalizeStatus(status);
          const existing = acc.find((item) => item.name === normalized);
          if (existing) {
            existing.value += result[status];
          } else {
            acc.push({ name: normalized, value: result[status] });
          }
          return acc;
        }, []);

        setData(transformed);

        
        if (mode === 'admin') {
          fetchInvertersByStatus('Operational(Ready to Hire)');
        }
      } catch (error) {
        console.error('Failed to fetch inverter status summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryAndDefault();
  }, [mode]);

  const totalInverters = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) return <p>Loading inverter summary...</p>;
  if (mode !== 'admin' && data.length === 0) return <p>No inverter data available.</p>;

  return (
    <div style={{ width: '100%', textAlign: 'center', paddingBottom: '2rem' }}>
      
      {mode !== 'admin' && (
        <div className="d-flex justify-content-center align-items-start gap-4 flex-wrap">
          <div style={{ width: '400px', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={renderCustomizedLabel}
                  onClick={(e) => fetchInvertersByStatus(e.name)}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

         
          <div>
            <table
              style={{
                borderCollapse: 'collapse',
                width: '300px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <thead style={{ backgroundColor: '#343a40', color: '#fff' }}>
                <tr>
                  <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr
                    key={index}
                    onClick={() => fetchInvertersByStatus(entry.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', fontWeight: 600 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          backgroundColor: COLORS[entry.name] || '#8884d8',
                          marginRight: '8px',
                          borderRadius: '2px',
                        }}
                      ></span>
                      {entry.name}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{entry.value}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>Total</td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{totalInverters}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      {mode === 'admin' && selectedStatus && (
        <div className="mt-5">
          <h5 className="text-dark fw-bold mb-3">Ready to Hire Units</h5>
          {inverterList.length === 0 ? (
            <p>No Batteries found.</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  {Object.keys(groupInvertersBy(inverterList, (inv) => inv.model || 'Unknown')).map((model) => (
                    <th key={model}>{model}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const groupedData = groupInvertersBy(inverterList, (inv) => inv.model || 'Unknown');
                  const maxRows = Math.max(...Object.values(groupedData).map((items) => items.length), 0);
                  return Array.from({ length: maxRows }, (_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.entries(groupedData).map(([model, items]) => (
                        <td key={model}>
                          {items[rowIndex] ? (
                            <span
                              className="text-primary"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleItemClick(items[rowIndex].given_start_name, items[rowIndex].id)}
                            >
                              {items[rowIndex].given_start_name}
                            </span>
                          ) : (
                            ''
                          )}
                        </td>
                      ))}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          )}
        </div>
      )}

      
      {mode !== 'admin' && selectedStatus && (
        <div className="mt-5">
          <h5 className="text-dark fw-bold mb-3">Batteries with status: {selectedStatus}</h5>
          {inverterList.length === 0 ? (
            <p>No Batteries found.</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  {Object.keys(groupInvertersBy(inverterList, (inv) => inv.model || 'Unknown')).map((model) => (
                    <th key={model}>{model}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const groupedData = groupInvertersBy(inverterList, (inv) => inv.model || 'Unknown');
                  const maxRows = Math.max(...Object.values(groupedData).map((items) => items.length), 0);
                  return Array.from({ length: maxRows }, (_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.entries(groupedData).map(([model, items]) => (
                        <td key={model}>{items[rowIndex]?.unit_id || ''}</td>
                      ))}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default InverterStatusChart;
