import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { MDBBtn, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import { toast } from 'react-toastify';

const LeaveApplicationPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    leave_type: 'CL',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const initialFormState = {
    leave_type: 'CL',
    start_date: '',
    end_date: '',
    reason: '',
  };

  const fetchLeaves = async () => {
    try {
      const res = await axiosInstance.get('/employee/leaves/');
      const list = Array.isArray(res.data) ? res.data : res.data.results || [];
      setLeaves(list);
    } catch (err) {
      console.error('Failed to load leaves', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axiosInstance.post('/employee/leaves/', form);
      toast.success('Leave request submitted successfully');

      // ✅ Reset form on success
      setForm(initialFormState);
      fetchLeaves();
    } catch (err) {
      console.error(err);

      const data = err.response?.data;
      let msg = 'Could not submit leave application';

      if (data?.non_field_errors?.length) {
        msg = data.non_field_errors[0]; // message from server
      }

      toast.error(msg);

      // ✅ Also reset form on error (after showing message)
      setForm(initialFormState);
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="max-w-7xl mx-auto mt-10 px-4"
     style={{ marginTop: "80px" }} >
      <form className="row g-2 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <label className="form-label">Leave Type</label>
          <select
            name="leave_type"
            className="form-select"
            value={form.leave_type}
            onChange={handleChange}
          >
            <option value="CL">Casual Leave</option>
            <option value="SL">Sick Leave</option>
            <option value="PL">Paid Leave</option>
            <option value="LOP">Loss of Pay</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            name="start_date"
            className="form-control"
            value={form.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            name="end_date"
            className="form-control"
            value={form.end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Reason</label>
          <input
            type="text"
            name="reason"
            className="form-control"
            value={form.reason}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12 mt-2">
          <MDBBtn type="submit" disabled={submitting} size="sm">
            {submitting ? 'Submitting...' : 'Apply Leave'}
          </MDBBtn>
        </div>
      </form>

      {/* Leave Table */}
      <MDBTable small hover responsive>
        <MDBTableHead light>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {leaves.length > 0 ? (
            leaves.map((lv, idx) => (
              <tr key={lv.id}>
                <td>{idx + 1}</td>
                <td>{lv.leave_type}</td>
                <td>{lv.start_date}</td>
                <td>{lv.end_date}</td>
                <td>{lv.status}</td>
                <td>{lv.reason}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No leave requests yet
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
    </div>
  );
};

export default LeaveApplicationPage;
