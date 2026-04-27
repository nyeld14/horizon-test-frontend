import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBContainer,
  MDBInput,
  MDBBtn,
  MDBCard,
  MDBCardBody,
} from "mdb-react-ui-kit";

const ServiceStatusList = ({ token }) => {
  const [newStatus, setNewStatus] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddStatus = async () => {
    if (!newStatus.trim()) return;
    try {
      await axiosInstance.post(
        "/service-statuses/",
        { service_status_name: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("✅ Service status added successfully!");
      setNewStatus("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding service status:", error);
    }
  };

  return (
    <MDBContainer className="py-5" style={{ maxWidth: "700px" }}>
      <MDBCard className="shadow-sm mb-4">
        <MDBCardBody>
          <h5 className="mb-3">
            <span className="text-primary me-2">➕</span> Add New Service Status
          </h5>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddStatus();
            }}
            className="d-flex gap-2 align-items-end"
          >
            <div className="flex-grow-1">
              <MDBInput
                label="Enter new service status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              />
            </div>
            <MDBBtn type="submit" color="primary" className="px-4 py-2">
              Add
            </MDBBtn>
          </form>

          {successMessage && (
            <div className="mt-3 p-2 bg-success bg-opacity-10 border border-success rounded text-success">
              {successMessage}
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default ServiceStatusList;
