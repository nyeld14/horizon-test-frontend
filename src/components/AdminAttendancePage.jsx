import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { MDBTable, MDBTableHead, MDBTableBody, MDBBtn } from 'mdb-react-ui-kit';

const AdminAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    email: '',
    from: '',
    to: '',
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.email) params.email = filters.email;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await axiosInstance.get('/employee/attendance/', { params });

      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];
      setRecords(list);
    } catch (err) {
      console.error('Failed to load attendance', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  return (
    <div className="mt-3">
      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-md-4">
          <label className="form-label">Employee Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={filters.email}
            onChange={handleFilterChange}
            placeholder="employee@example.com"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">From Date</label>
          <input
            type="date"
            name="from"
            className="form-control"
            value={filters.from}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">To Date</label>
          <input
            type="date"
            name="to"
            className="form-control"
            value={filters.to}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <MDBBtn type="submit" size="sm">
            Filter
          </MDBBtn>
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <MDBTable small hover responsive>
          <MDBTableHead light>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Status</th>
              <th>Employee</th>
              <th>Email</th>
              <th>Remarks</th>
              
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {records.length > 0 ? (
              records.map((rec, idx) => (
                <tr key={rec.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{rec.date}</td>
                  <td>{rec.status}</td>
                  <td>{rec.user_name || '-'}</td>
                  <td>{rec.email || '-'}</td>
                  <td>{rec.remarks || '-'}</td>
                  {/* <td>{rec.check_in_time || '-'}</td>
                  <td>{rec.check_out_time || '-'}</td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No attendance records found.
                </td>
              </tr>
            )}
          </MDBTableBody>
        </MDBTable>
      )}
    </div>
  );
};

export default AdminAttendancePage;
