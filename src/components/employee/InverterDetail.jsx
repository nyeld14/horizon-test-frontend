import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBSpinner,
} from 'mdb-react-ui-kit';

const InverterDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUnitInfo = async () => {
      try {
        const res = await axiosInstance.get(`/inverters/${id}/unit-info/`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch unit info', err);
        setError('Failed to load unit information.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnitInfo();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <MDBSpinner role="status" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-5 text-center">
        <p className="text-danger">{error || 'No data found.'}</p>
        <Link to="/employee-dashboard" className="btn btn-outline-primary">
          ⬅ Back to Dashboard
        </Link>
      </div>
    );
  }

  const {
    inverter,
    current_unit_details,
    all_orders,
    status_history,
    service_records,
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">
          Unit Information – {inverter?.given_name} ({inverter?.unit_id})
        </h3>
        <Link
          to="/employee-dashboard?tab=inverter-list"
          className="btn btn-outline-secondary btn-sm"
        >
          ⬅ Back to Dashboard
        </Link>
      </div>

      {/* 1) Current Unit Details */}
      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="fs-5 mb-3">
            Current Unit Details
          </MDBCardTitle>

          <div className="row">
            <div className="col-md-4">
              <MDBCardText>
                <strong>Client:</strong> {current_unit_details.client}
              </MDBCardText>
              <MDBCardText>
                <strong>PO Number:</strong> {current_unit_details.po_number}
              </MDBCardText>
              <MDBCardText>
                <strong>Contract No:</strong> {current_unit_details.contract_no}
              </MDBCardText>
            </div>

            <div className="col-md-4">
              <MDBCardText>
                <strong>Location:</strong> {current_unit_details.location}
              </MDBCardText>
              <MDBCardText>
                <strong>Generator No:</strong>{' '}
                {current_unit_details.generator_no}
              </MDBCardText>
              <MDBCardText>
                <strong>Fuel Price:</strong>{' '}
                {current_unit_details.fuel_price}
              </MDBCardText>
            </div>

            <div className="col-md-4">
              <MDBCardText>
                <strong>Start Date:</strong>{' '}
                {current_unit_details.start_date}
              </MDBCardText>
              <MDBCardText>
                <strong>End Date:</strong>{' '}
                {current_unit_details.end_date}
              </MDBCardText>
              <MDBCardText>
                <strong>Current Status:</strong>{' '}
                {current_unit_details.current_status}
              </MDBCardText>
            </div>
          </div>
        </MDBCardBody>
      </MDBCard>

      {/* 2) Order History */}
      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="fs-5 mb-3">Order History</MDBCardTitle>

          {all_orders && all_orders.length > 0 ? (
            <div className="table-responsive">
              <MDBTable hover small>
                <MDBTableHead light>
                  <tr>
                    <th>#</th>
                    <th>PO Number</th>
                    <th>Contract No</th>
                    <th>Client</th>
                    <th>Location</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {all_orders.map((order, idx) => (
                    <tr key={order.id}>
                      <td>{idx + 1}</td>
                      <td>{order.po_number}</td>
                      <td>{order.contract_no}</td>
                      <td>{order.client_name || '--'}</td>
                      <td>{order.location_name || '--'}</td>
                      <td>{order.start_date || '--'}</td>
                      <td>{order.end_date || '--'}</td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </div>
          ) : (
            <p className="text-muted mb-0">No previous orders for this unit.</p>
          )}
        </MDBCardBody>
      </MDBCard>

      {/* 3) Service Records */}
      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="fs-5 mb-3">Service Records</MDBCardTitle>

          {service_records?.length > 0 ? (
            <div className="table-responsive">
              <MDBTable hover small>
                <MDBTableHead light>
                  <tr>
                    <th>#</th>
                    <th>Token No</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Problem</th>
                    <th>Repair</th>
                    <th>Base</th>
                    <th>Service Location</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {service_records.map((sr, idx) => (
                    <tr key={sr.id}>
                      <td>{idx + 1}</td>
                      <td>{sr.service_token_number}</td>
                      <td>{sr.date_of_service}</td>
                      <td>{sr.status_name || '--'}</td>
                      <td>{sr.problem}</td>
                      <td>{sr.repair_done}</td>
                      <td>{sr.base}</td>
                      <td>{sr.service_location}</td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </div>
          ) : (
            <p className="text-muted mb-0">No service records.</p>
          )}
        </MDBCardBody>
      </MDBCard>

      {/* 4) Status History */}
      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="fs-5 mb-3">Status History</MDBCardTitle>

          {status_history?.length > 0 ? (
            <MDBTable hover small>
              <MDBTableHead light>
                <tr>
                  <th>#</th>
                  <th>Previous Status</th>
                  <th>Current Status</th>
                  <th>Changed At</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {status_history.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{row.previous_status_name || '--'}</td>
                    <td>{row.new_status_name || '--'}</td>
                    <td>
                      {row.changed_at
                        ? new Date(row.changed_at).toLocaleString()
                        : '--'}
                    </td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          ) : (
            <p className="text-muted mb-0">No status history records.</p>
          )}
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default InverterDetail;


