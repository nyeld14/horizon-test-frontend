import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const STATUS_COLOR = {
  PRESENT: 'bg-success text-white',
  ABSENT: 'bg-warning',
  WFH: 'bg-info text-white',
};

const AdminAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/employee/attendance/');
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setRecords(data);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  /* ================= GROUP BY EMPLOYEE ================= */

  const employees = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!r.user_name) return;
      if (!map[r.user_name]) map[r.user_name] = [];
      map[r.user_name].push(r);
    });

    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, records: map[name] }));
  }, [records]);

  /* ================= MONTH NAVIGATION ================= */

  const changeMonth = (direction) => {
    const [y, m] = month.split('-').map(Number);
    const newDate = new Date(y, m - 1 + direction, 1);
    setMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const monthLabel = new Date(`${month}-01`).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  /* ================= CALENDAR BUILDER ================= */

  const buildCalendar = (employeeRecords) => {
    const [year, monthIndex] = month.split('-').map(Number);
    const firstDay = new Date(year, monthIndex - 1, 1);
    const lastDate = new Date(year, monthIndex, 0).getDate();

    const calendar = [];
    let week = Array(firstDay.getDay()).fill(null);

    for (let day = 1; day <= lastDate; day++) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`;
      const record = employeeRecords.find((r) => r.date === dateStr);
      week.push({ day, record });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    if (week.length) {
      while (week.length < 7) week.push(null);
      calendar.push(week);
    }

    return calendar;
  };

  /* ================= UI ================= */

  return (
    <div className="mt-3">
      <h5 className="mb-3">Attendance Calendar</h5>

      {/* ================= EMPLOYEE LIST ================= */}
      {!selectedEmployee && (
        <div className="list-group mb-4">
          {employees.map((emp) => (
            <button
              key={emp.name}
              className="list-group-item list-group-item-action"
              onClick={() => setSelectedEmployee(emp)}
            >
              {emp.name}
            </button>
          ))}
        </div>
      )}

      {/* ================= EMPLOYEE CALENDAR ================= */}
      {selectedEmployee && (
        <>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setSelectedEmployee(null)}
            >
              ← Back
            </button>

            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => changeMonth(-1)}
              >
                ←
              </button>

              <strong>{monthLabel}</strong>

              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => changeMonth(1)}
              >
                →
              </button>
            </div>
          </div>

          <h6 className="mb-2">{selectedEmployee.name}</h6>

          {/* Calendar */}
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead className="table-dark">
                <tr>
                  <th>SUN</th>
                  <th>MON</th>
                  <th>TUE</th>
                  <th>WED</th>
                  <th>THU</th>
                  <th>FRI</th>
                  <th>SAT</th>
                </tr>
              </thead>

              <tbody>
                {buildCalendar(selectedEmployee.records).map((week, i) => (
                  <tr key={i}>
                    {week.map((cell, idx) => {
                      if (!cell)
                        return <td key={idx} className="bg-light"></td>;

                      const isWeekend = idx === 0 || idx === 6;
                      const status = cell.record?.status;

                      let className = 'p-3';
                      if (isWeekend) className += ' bg-danger text-white';
                      else if (status)
                        className += ` ${STATUS_COLOR[status]}`;
                      else className += ' bg-light';

                      return (
                        <td key={idx} className={className}>
                          <div className="fw-bold">{cell.day}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="d-flex flex-wrap gap-3 mt-3">
            <span className="badge bg-success">Present</span>
            <span className="badge bg-warning text-dark">Absent</span>
            <span className="badge bg-info">WFH</span>
            <span className="badge bg-danger">Weekend</span>
            <span className="badge bg-secondary">No Record</span>
          </div>
        </>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default AdminAttendancePage;
