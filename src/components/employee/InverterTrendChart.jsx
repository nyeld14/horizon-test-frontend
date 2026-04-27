import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import dayjs from 'dayjs';

const STATUS_OPTIONS = [
  'Operational(Ready to Hire)',
  'Breakdown',
  'Testing',
  'Hired',
];

const COLORS = {
  Breakdown: '#FF0000',
  Testing: '#FFA500',
  'Operational(Ready to Hire)': '#0000FF',
  Hired: '#008000',
};

const InverterTrendLineChart = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = dayjs().format('YYYY-MM-DD');
  const [dateRange, setDateRange] = useState('7days');
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(today);

  const [activeStatuses, setActiveStatuses] = useState(STATUS_OPTIONS);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

 
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axiosInstance.get('/inverters/?page=1');
        const uniqueModels = [...new Set(res.data.results.map(i => i.model))];
        setModels(uniqueModels);
      } catch (err) {
        console.error('Failed to fetch models:', err);
      }
    };
    fetchModels();
  }, []);

  
  useEffect(() => {
    const end = dayjs();
    let start = end;

    if (dateRange === '7days') start = end.subtract(6, 'day');
    else if (dateRange === '14days') start = end.subtract(13, 'day');
    else if (dateRange === '30days') start = end.subtract(29, 'day');
    else if (dateRange === '90days') start = end.subtract(89, 'day');
    else if (dateRange === '180days') start = end.subtract(179, 'day');
    else if (dateRange === 'today') start = end;

    setStartDate(start.format('YYYY-MM-DD'));
    setEndDate(end.format('YYYY-MM-DD'));
  }, [dateRange]);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        setError('');
        const url = `/inverter-status-trend/?start_date=${startDate}&end_date=${endDate}${selectedModel ? `&model=${selectedModel}` : ''}`;
        const res = await axiosInstance.get(url);

       
        const data = Array.isArray(res.data) ? res.data : [];
        setTrendData(data);
      } catch (err) {
        console.error('Failed to fetch inverter trend:', err);
        setError('Failed to load data from server.');
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendData();
  }, [startDate, endDate, selectedModel]);

  const formatXAxisLabel = (value) => dayjs(value).format('DD MMM');

  return (
 <div className="p-4 text-center">
  <h4
     className="fw-bold mb-4 mt-3 mt-md-4"
    style={{ marginTop: '40px' }}
  >

        Battery Utilization  ({startDate} → {endDate})
      </h4>

     
      <div className="d-flex justify-content-center align-items-center gap-3 mb-3 flex-wrap">
      
        <div>
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
        </div>

        
        {dateRange === 'custom' && (
          <div className="d-flex align-items-center gap-2">
            <label>From:</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label>To:</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

       
        <div>
          <label className="fw-semibold me-2">Model:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="">All Models</option>
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

     
      <div className="d-flex justify-content-center flex-wrap gap-4 mb-4">
        {STATUS_OPTIONS.map(status => (
          <label key={status} className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={activeStatuses.includes(status)}
              onChange={() =>
                setActiveStatuses(prev =>
                  prev.includes(status)
                    ? prev.filter(s => s !== status)
                    : [...prev, status]
                )
              }
            />
            <span style={{ color: COLORS[status], fontWeight: '600' }}>
              {status}
            </span>
          </label>
        ))}
      </div>

      
      {loading ? (
        <p>Loading inverter trend data...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : trendData.length === 0 ? (
        <p className="text-muted">No data available for this range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(val, name) => [`${val}%`, name]}
              labelFormatter={(label) => `Date: ${dayjs(label).format('DD MMM YYYY')}`}
            />
            <Legend />
            {activeStatuses.map(
              (status) =>
                trendData.some((d) => d[status] !== undefined) && (
                  <Line
                    key={status}
                    type="monotone"
                    dataKey={status}
                    stroke={COLORS[status]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InverterTrendLineChart;
