import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBSpinner,
} from "mdb-react-ui-kit";

const DistroDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 🚫 Guard: prevent API call for invalid IDs like "NIL"
    if (!id || id === "NIL") {
      setError("Invalid distro selected.");
      setLoading(false);
      return;
    }

    const fetchDistroInfo = async () => {
      try {
        const res = await axiosInstance.get(
          `/distro/distros/${id}/unit-info/`
        );
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch distro info", err);
        setError("Failed to load distro information.");
      } finally {
        setLoading(false);
      }
    };

    fetchDistroInfo();
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
        <p className="text-danger">{error || "No data found."}</p>
        <Link
          to="/employee-dashboard?tab=distro-list"
          className="btn btn-outline-primary"
        >
          ⬅ Back to Dashboard
        </Link>
      </div>
    );
  }

  const { distro, current_unit_details, all_orders, status_history } = data;

  const isTesting =
    distro?.distro_status?.distro_status_name === "Testing";

  const installationLink =
    distro?.link_to_installation &&
    !["null", "NIL", "nil"].includes(
      distro.link_to_installation.trim()
    )
      ? distro.link_to_installation
      : null;


  return (
    <div className="max-w-7xl mx-auto px-4 mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">
          Distro Information – {distro?.given_name} ({distro?.serial_no})
        </h3>
        <Link
          to="/employee-dashboard?tab=distro-list"
          className="btn btn-outline-secondary btn-sm"
        >
          ⬅ Back to Dashboard
        </Link>
      </div>

      {/* 1) Current Distro Details */}
      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="fs-5 mb-3">
            Current Distro Details
          </MDBCardTitle>

          <div className="row">
            <div className="col-md-4">
              <MDBCardText>
                <strong>Client:</strong>{" "}
                {isTesting ? "---" : current_unit_details?.client || "---"}
              </MDBCardText>

              <MDBCardText>
                <strong>PO Number:</strong>{" "}
                {isTesting ? "---" : current_unit_details?.po_number || "---"}
              </MDBCardText>
            </div>

            <div className="col-md-4">
              <MDBCardText>
                <strong>Location:</strong>{" "}
                {isTesting ? "Yard" : current_unit_details?.location || "---"}
              </MDBCardText>

              <MDBCardText>
                <strong>Start Date:</strong>{" "}
                {isTesting ? "---" : current_unit_details?.start_date || "---"}
              </MDBCardText>

              <MDBCardText>
                <strong>End Date:</strong>{" "}
                {isTesting ? "---" : current_unit_details?.end_date || "---"}
              </MDBCardText>
            </div>

            <div className="col-md-4">
              <MDBCardText>
                <strong>Status:</strong>{" "}
                {distro?.distro_status?.distro_status_name || "---"}
              </MDBCardText>

              <MDBCardText>
                <strong>Remarks:</strong>{" "}
                {distro?.remarks || "---"}
              </MDBCardText>

              {/* ✅ Installation Link */}
              <MDBCardText>
                <strong>Installation Link:</strong>{" "}
                {installationLink ? (
                  <a
                    href={installationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary ms-2"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-muted ms-2">nil</span>
                )}
              </MDBCardText>
            </div>
          </div>
        </MDBCardBody>
      </MDBCard>

      {/* 2) Distro Order History */}
      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="fs-5 mb-3">
            Distro Order History
          </MDBCardTitle>

          {all_orders?.length > 0 ? (
            <MDBTable hover small>
              <MDBTableHead light>
                <tr>
                  <th>#</th>
                  <th>PO Number</th>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {all_orders.map((o, idx) => (
                  <tr key={o.id}>
                    <td>{idx + 1}</td>
                    <td>{o.po_number}</td>
                    <td>{o.client_name}</td>
                    <td>{o.location_name}</td>
                    <td>{o.start_date}</td>
                    <td>{o.end_date || "Active"}</td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          ) : (
            <p className="text-muted mb-0">No orders for this distro.</p>
          )}
        </MDBCardBody>
      </MDBCard>

      {/* 3) Status History */}
      <MDBCard className="shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="fs-5 mb-3">
            Status History
          </MDBCardTitle>

          {status_history?.length > 0 ? (
            <MDBTable hover small>
              <MDBTableHead light>
                <tr>
                  <th>#</th>
                  <th>Previous</th>
                  <th>Current</th>
                  <th>Changed At</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {status_history.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row.previous_status_name || "--"}</td>
                    <td>{row.new_status_name || "--"}</td>
                    <td>
                      {row.changed_at
                        ? new Date(row.changed_at).toLocaleString()
                        : "--"}
                    </td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          ) : (
            <p className="text-muted mb-0">No status history.</p>
          )}
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default DistroDetail;
