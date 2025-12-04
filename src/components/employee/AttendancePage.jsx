import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { MDBBtn, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/employee/attendance/');

      // Handle both paginated and non-paginated responses
      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];

      setRecords(list);
    } catch (err) {
      console.error('Failed to load attendance', err);
      setRecords([]); // fallback to empty array so .map never crashes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Find if today's attendance is already marked
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const todayRecord = records.find((r) => r.date === today);
  const attendanceLocked = !!todayRecord;

  const markToday = async (status) => {
    // If Absent -> remarks required
    if (status === 'ABSENT' && !remarks.trim()) {
      alert('Please enter a reason in Remarks when marking Absent.');
      return;
    }

    try {
      await axiosInstance.post('/employee/attendance/mark-today/', {
        status,
        remarks: remarks.trim(),
      });
      setRemarks('');
      fetchAttendance();
    } catch (err) {
      console.error('Failed to mark attendance', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.remarks?.[0] ||
        'Could not mark attendance';
      alert(msg);
    }
  };

  return (
    <div className="mt-3">
      {/* Remarks input */}
      <div className="mb-2">
        <label className="form-label">
          Remarks (optional for Present / WFH, <strong>required for Absent</strong>)
        </label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={attendanceLocked}
          placeholder="Reason / note for today"
        />
      </div>

      {/* Action buttons */}
      <div className="mb-3 d-flex gap-2">
        <MDBBtn
          size="sm"
          color="success"
          onClick={() => markToday('PRESENT')}
          disabled={attendanceLocked}
        >
          Mark Present
        </MDBBtn>
        <MDBBtn
          size="sm"
          color="danger"
          onClick={() => markToday('ABSENT')}
          disabled={attendanceLocked}
        >
          Mark Absent
        </MDBBtn>
        <MDBBtn
          size="sm"
          color="info"
          onClick={() => markToday('WFH')}
          disabled={attendanceLocked}
        >
          Work From Home
        </MDBBtn>
      </div>

      {attendanceLocked && (
        <p className="small text-success mb-3">
          ✅ Attendance already marked for today ({todayRecord.status}
          {todayRecord.remarks ? ` – ${todayRecord.remarks}` : ''})
        </p>
      )}

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <MDBTable small hover responsive>
          <MDBTableHead light>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {Array.isArray(records) && records.length > 0 ? (
              records.map((rec, idx) => (
                <tr key={rec.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{rec.date}</td>
                  <td>{rec.status}</td>
                  <td>{rec.remarks || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
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

export default AttendancePage;
