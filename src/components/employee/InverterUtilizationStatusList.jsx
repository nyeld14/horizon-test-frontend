import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBContainer,
  MDBInput,
  MDBBtn,
  MDBCard,
  MDBCardBody,
} from "mdb-react-ui-kit";

const InverterUtilizationStatusList = () => {
  const [formData, setFormData] = useState({ inverter_utilization_status_name: "" });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/inverter-utilization-statuses/", formData);
      setFormData({ inverter_utilization_status_name: "" });
      setSuccessMessage("✅ Utilization status added successfully!");

      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
    }
  };

  return (
    <MDBContainer className="py-5">
      <h2 className="text-center mb-4 fw-bold">Add Inverter Utilization Status</h2>

      <MDBCard className="mb-4 shadow">
        <MDBCardBody>
          <form onSubmit={handleSubmit} className="d-flex gap-3 align-items-center">
            <MDBInput
              label="Utilization Status Name"
              name="inverter_utilization_status_name"
              value={formData.inverter_utilization_status_name}
              onChange={handleChange}
              required
              className="flex-grow-1"
            />
            <MDBBtn color="primary" type="submit">
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

export default InverterUtilizationStatusList;
