import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBIcon,
} from 'mdb-react-ui-kit';

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [remarks, setRemarks] = useState('');
  const [rdMinutes, setRdMinutes] = useState('');

  // Date & backdate
  const [selectedDate, setSelectedDate] = useState('');
  const [pastCheckIn, setPastCheckIn] = useState('');
  const [pastCheckOut, setPastCheckOut] = useState('');
  const [pastRdMinutes, setPastRdMinutes] = useState('');

  // RD edit
  const [editRdId, setEditRdId] = useState(null);
  const [editRdMinutes, setEditRdMinutes] = useState('');

  // 🔔 Toast
  const [toast, setToast] = useState({
    show: false,
    message: '',
    color: 'info',
  });

  const showToast = (message, color = 'info') => {
    setToast({ show: true, message, color });
    setTimeout(() => {
      setToast({ show: false, message: '', color: 'info' });
    }, 3000);
  };

  const today = new Date().toISOString().slice(0, 10);

  /* ================= FETCH ================= */

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/employee/attendance/');
      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];
      setRecords(list);
    } catch {
      setRecords([]);
      showToast('Failed to load attendance', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const todayRecord = records.find((r) => r.date === today);

  const canSignOut =
    todayRecord &&
    ['PRESENT', 'WFH'].includes(todayRecord.status) &&
    !todayRecord.check_out_time;

  /* ================= MARK ATTENDANCE ================= */

  const markDateAttendance = async (status) => {
    if (!selectedDate) {
      showToast('Please select a date', 'warning');
      return;
    }

    if (status === 'ABSENT' && !remarks.trim()) {
      showToast('Remarks required for Absent', 'warning');
      return;
    }

    try {
      await axiosInstance.post('/employee/attendance/mark-date/', {
        status,
        remarks: remarks.trim(),
        date: selectedDate,
        check_in_time: selectedDate < today ? pastCheckIn : null,
        check_out_time: selectedDate < today ? pastCheckOut : null,
        rd_minutes: selectedDate < today ? pastRdMinutes || 0 : 0,
      });

      showToast('Attendance marked successfully', 'success');

      setRemarks('');
      setSelectedDate('');
      setPastCheckIn('');
      setPastCheckOut('');
      setPastRdMinutes('');
      fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to mark attendance', 'danger');
    }
  };

  /* ================= SIGN OUT ================= */

  const signOutToday = async () => {
    try {
      await axiosInstance.post('/employee/attendance/sign-out/', {
        rd_minutes: rdMinutes || 0,
      });
      showToast('Signed out successfully', 'success');
      setRdMinutes('');
      fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not sign out', 'danger');
    }
  };

  /* ================= EDIT RD ================= */

  const saveEditedRd = async (id) => {
    try {
      await axiosInstance.patch(
        `/employee/attendance/${id}/update-rd-time/`,
        { rd_minutes: editRdMinutes }
      );
      showToast('RD time updated', 'success');
      setEditRdId(null);
      setEditRdMinutes('');
      fetchAttendance();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update RD time', 'danger');
    }
  };

  return (
     <div className="max-w-7xl mx-auto mt-10 px-4"
     style={{ marginTop: "80px" }} >
{toast.show && (
  <div
    style={{
      position: 'fixed',
      top: '70px',            // ⬅ below navbar
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999999,         // ⬅ higher than sidebar/header
      background: '#fff',
      borderRadius: '6px',
      minWidth: '360px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      padding: '12px 18px',
      textAlign: 'center',
      pointerEvents: 'auto',
    }}
  >
    <span
      style={{
        color:
          toast.color === 'success'
            ? '#198754'
            : toast.color === 'danger'
            ? '#dc3545'
            : toast.color === 'warning'
            ? '#ffc107'
            : '#0dcaf0',
        fontWeight: 600,
      }}
    >
      {toast.message}
    </span>
  </div>
)}



      {/* Attendance Date */}
      <div className="mb-2"  >
        <label className="form-label">Attendance Date</label>
        <input
          type="date"
          className="form-control form-control-sm"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Past date inputs */}
      {selectedDate && selectedDate < today && (
        <>
          <div className="mb-2">
            <label className="form-label">Check In Time</label>
            <input
              type="time"
              className="form-control form-control-sm"
              value={pastCheckIn}
              onChange={(e) => setPastCheckIn(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Check Out Time</label>
            <input
              type="time"
              className="form-control form-control-sm"
              value={pastCheckOut}
              onChange={(e) => setPastCheckOut(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">RD Time (minutes)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="0"
              value={pastRdMinutes}
              onChange={(e) => setPastRdMinutes(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Remarks */}
      <div className="mb-2">
        <label className="form-label">Remarks</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Reason / note"
        />
      </div>

      {/* RD before sign out */}
      {canSignOut && (
        <div className="mb-2">
          <label className="form-label">RD Time (minutes)</label>
          <input
            type="number"
            className="form-control form-control-sm"
            min="0"
            value={rdMinutes}
            onChange={(e) => setRdMinutes(e.target.value)}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <MDBBtn size="sm" color="success" onClick={() => markDateAttendance('PRESENT')}>
          Mark Present
        </MDBBtn>
        <MDBBtn size="sm" color="danger" onClick={() => markDateAttendance('ABSENT')}>
          Mark Absent
        </MDBBtn>
        <MDBBtn size="sm" color="info" onClick={() => markDateAttendance('WFH')}>
          Work From Home
        </MDBBtn>
        {canSignOut && (
          <MDBBtn size="sm" color="secondary" onClick={signOutToday}>
            Sign Out
          </MDBBtn>
        )}
      </div>

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
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Work</th>
              <th>RD Time</th>
              <th>Remarks</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {records.length ? (
              records.map((rec, idx) => (
                <tr key={rec.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{rec.date}</td>
                  <td>{rec.status}</td>
                  <td>{rec.check_in_display || '-'}</td>
                  <td>{rec.check_out_display || '-'}</td>
                  <td>{rec.total_work_display || '-'}</td>
                  <td>
  {editRdId === rec.id ? (
    <>
      <input
        type="number"
        className="form-control form-control-sm"
        min="0"
        placeholder="Minutes"
        value={editRdMinutes}
        onChange={(e) => setEditRdMinutes(e.target.value)}
      />
      <div className="mt-1 d-flex gap-2">
        <MDBBtn
          size="sm"
          color="success"
          onClick={() => saveEditedRd(rec.id)}
        >
          Save
        </MDBBtn>
        <MDBBtn
          size="sm"
          color="secondary"
          onClick={() => {
            setEditRdId(null);
            setEditRdMinutes('');
          }}
        >
          Cancel
        </MDBBtn>
      </div>
    </>
  ) : (
                          <div className="d-flex align-items-center gap-2">
                            <span>{rec.rd_time_display || '-'}</span>

                            {/* ✏️ ALWAYS SHOW EDIT ICON (except ABSENT optional) */}
                            {rec.status !== 'ABSENT' && (
                              <MDBIcon
                                icon="pen"
                                className="text-primary"
                                role="button"
                                title="Add / Edit RD Time"
                                onClick={() => {
                                  setEditRdId(rec.id);
                                  setEditRdMinutes(
                                    rec.rd_time_display
                                      ? parseInt(rec.rd_time_display) || ''
                                      : ''
                                  );
                                }}
                              />
                            )}
                          </div>
                        )}
                      </td>

                  <td>{rec.remarks || '-'}</td>
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

export default AttendancePage;
