import React, { useEffect, useMemo, useState } from 'react';
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

  // Edit attendance
  const [editRecordId, setEditRecordId] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editRdMinutes, setEditRdMinutes] = useState('');

  // Original values for comparison
  const [originalCheckIn, setOriginalCheckIn] = useState('');
  const [originalCheckOut, setOriginalCheckOut] = useState('');
  const [originalRdMinutes, setOriginalRdMinutes] = useState('');

  // Month navigation
  const todayDate = new Date();
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());

  // Toast
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

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/employee/attendance/');
      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];

      const sortedList = [...list].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setRecords(sortedList);
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
      showToast(
        err.response?.data?.detail || 'Failed to mark attendance',
        'danger'
      );
    }
  };

  const signOutToday = async () => {
    try {
      await axiosInstance.post('/employee/attendance/sign-out/', {
        rd_minutes: rdMinutes || 0,
      });
      showToast('Signed out successfully', 'success');
      setRdMinutes('');
      fetchAttendance();
    } catch (err) {
      showToast(
        err.response?.data?.detail || 'Could not sign out',
        'danger'
      );
    }
  };

  const startEdit = (rec) => {
    const checkIn = rec.check_in_time || '';
    const checkOut = rec.check_out_time || '';
    const rd = String(rec.rd_time_minutes ?? 0);

    setEditRecordId(rec.id);
    setEditCheckIn(checkIn);
    setEditCheckOut(checkOut);
    setEditRdMinutes(rd);

    setOriginalCheckIn(checkIn);
    setOriginalCheckOut(checkOut);
    setOriginalRdMinutes(rd);
  };

  const cancelEdit = () => {
    setEditRecordId(null);
    setEditCheckIn('');
    setEditCheckOut('');
    setEditRdMinutes('');
    setOriginalCheckIn('');
    setOriginalCheckOut('');
    setOriginalRdMinutes('');
  };

  const hasChanges = (rec) => {
    if (editRecordId !== rec.id) return false;

    return (
      editCheckIn !== originalCheckIn ||
      editCheckOut !== originalCheckOut ||
      editRdMinutes !== originalRdMinutes
    );
  };

  const saveEditedAttendance = async (rec) => {
    try {
      const payload = {};

      if (editCheckIn !== originalCheckIn) {
        payload.check_in_time = editCheckIn || null;
      }

      if (editCheckOut !== originalCheckOut) {
        payload.check_out_time = editCheckOut || null;
      }

      if (editRdMinutes !== originalRdMinutes) {
        payload.rd_minutes =
          editRdMinutes === '' ? 0 : parseInt(editRdMinutes, 10);
      }

      if (Object.keys(payload).length === 0) {
        showToast('No changes made', 'warning');
        return;
      }

      await axiosInstance.patch(
        `/employee/attendance/${rec.id}/update-attendance/`,
        payload
      );

      showToast('Attendance updated', 'success');
      cancelEdit();
      fetchAttendance();
    } catch (err) {
      showToast(
        err.response?.data?.detail || 'Failed to update attendance',
        'danger'
      );
    }
  };

  const currentMonthRecords = useMemo(() => {
    return records.filter((rec) => {
      const d = new Date(rec.date);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
  }, [records, viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const isCurrentMonth =
    viewYear === todayDate.getFullYear() &&
    viewMonth === todayDate.getMonth();

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto mt-10 px-4"
      style={{ marginTop: '80px' }}
    >
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
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

      <div className="mb-2">
        <label className="form-label">Attendance Date</label>
        <input
          type="date"
          className="form-control form-control-sm"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <MDBBtn size="sm" color="light" onClick={goToPreviousMonth}>
          <MDBIcon icon="chevron-left" />
        </MDBBtn>

        <h4 className="mb-0 fw-bold text-primary">{monthLabel}</h4>

        <MDBBtn
          size="sm"
          color="light"
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
        >
          <MDBIcon
            icon="chevron-right"
            className={isCurrentMonth ? 'text-muted' : ''}
          />
        </MDBBtn>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <MDBTable small hover responsive bordered>
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
            {currentMonthRecords.length ? (
              currentMonthRecords.map((rec, idx) => (
                <tr key={rec.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{rec.date}</td>
                  <td>{rec.status}</td>

                  <td>
                    {editRecordId === rec.id ? (
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={editCheckIn}
                        onChange={(e) => setEditCheckIn(e.target.value)}
                        disabled={rec.status === 'ABSENT'}
                      />
                    ) : (
                      rec.check_in_display || '-'
                    )}
                  </td>

                  <td>
                    {editRecordId === rec.id ? (
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={editCheckOut}
                        onChange={(e) => setEditCheckOut(e.target.value)}
                        disabled={rec.status === 'ABSENT'}
                      />
                    ) : (
                      rec.check_out_display || '-'
                    )}
                  </td>

                  <td>{rec.total_work_display || '-'}</td>

                  <td>
                    {editRecordId === rec.id ? (
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
                            onClick={() => saveEditedAttendance(rec)}
                            disabled={!hasChanges(rec)}
                          >
                            Save
                          </MDBBtn>
                          <MDBBtn
                            size="sm"
                            color="secondary"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </MDBBtn>
                        </div>
                      </>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <span>{rec.rd_time_display || '-'}</span>
                        {rec.status !== 'ABSENT' && (
                          <MDBIcon
                            icon="pen"
                            className="text-primary"
                            role="button"
                            title="Edit attendance"
                            onClick={() => startEdit(rec)}
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
                  No attendance records found for {monthLabel}.
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