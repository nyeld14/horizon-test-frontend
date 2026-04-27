import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { MDBBtn, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import { toast } from 'react-toastify';

const AdminLeaveApprovalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarksById, setRemarksById] = useState({}); // manager remarks per row

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/employee/leaves/');
      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];
      setLeaves(list);
    } catch (err) {
      console.error('Failed to load leaves', err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleRemarksChange = (id, value) => {
    setRemarksById((prev) => ({ ...prev, [id]: value }));
  };

  const approveLeave = async (id) => {
    try {
      await axiosInstance.post(`/employee/leaves/${id}/approve/`, {
        manager_remarks: remarksById[id] || '',
      });
      toast.success('Leave approved and email sent (if configured).');
      fetchLeaves();
    } catch (err) {
      console.error('Failed to approve leave', err);
      toast.error('Could not approve leave');
    }
  };

  const rejectLeave = async (id) => {
    try {
      await axiosInstance.post(`/employee/leaves/${id}/reject/`, {
        manager_remarks: remarksById[id] || '',
      });
      toast.info('Leave rejected and email sent (if configured).');
      fetchLeaves();
    } catch (err) {
      console.error('Failed to reject leave', err);
      toast.error('Could not reject leave');
    }
  };

  return (
    <div className="mt-3">
      <h5 className="mb-3">Leave Requests</h5>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <MDBTable small hover responsive>
          <MDBTableHead light>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Email</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Manager Remarks</th>
              <th>Actions</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {leaves.length > 0 ? (
              leaves.map((lv, idx) => (
                <tr key={lv.id}>
                  <td>{idx + 1}</td>
                  <td>{lv.user_name || '-'}</td>
                  <td>{lv.email || '-'}</td>
                  <td>{lv.leave_type}</td>
                  <td>{lv.start_date}</td>
                  <td>{lv.end_date}</td>
                  <td>{lv.status}</td>
                  <td>{lv.reason}</td>
                  <td style={{ minWidth: '180px' }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Manager remarks"
                      value={remarksById[lv.id] || ''}
                      onChange={(e) =>
                        handleRemarksChange(lv.id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {lv.status === 'PENDING' ? (
                      <div className="d-flex gap-1">
                        <MDBBtn
                          size="sm"
                          color="success"
                          onClick={() => approveLeave(lv.id)}
                        >
                          Approve
                        </MDBBtn>
                        <MDBBtn
                          size="sm"
                          color="danger"
                          onClick={() => rejectLeave(lv.id)}
                        >
                          Reject
                        </MDBBtn>
                      </div>
                    ) : (
                      <span className="text-muted small">
                        Already {lv.status.toLowerCase()}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-muted">
                  No leave requests found.
                </td>
              </tr>
            )}
          </MDBTableBody>
        </MDBTable>
      )}
    </div>
  );
};

export default AdminLeaveApprovalPage;
