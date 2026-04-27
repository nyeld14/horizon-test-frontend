
import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const AddLocationForm = () => {
  const [locationName, setLocationName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");


  const locationRegex = /^[A-Za-z0-9 ]+$/;

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");
    setValidationError("");

  
    if (!locationRegex.test(locationName.trim())) {
      setValidationError(
        "Example: 'New York 123' (alphanumeric and spaces only)"
      );
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      await axiosInstance.post(
        "locations/",
        {
          location_name: locationName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("✅ Location added successfully!");
      setLocationName("");
    } catch (err) {
      console.error(err.response?.data || err.message);

    
      if (err.response?.data?.location_name) {
        setValidationError(err.response.data.location_name[0]);
      } else {
        setError("❌ Failed to add location. Please try again.");
      }
    }
  };

  return (
    <form
      onSubmit={handleAddLocation}
      className="text-start mx-auto"
      style={{ maxWidth: "400px",marginTop: "40px"  }}
    >
      {successMessage && <p className="text-success">{successMessage}</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="mb-3">
        <label className="form-label fw-semibold">Location Name</label>
        <input
          type="text"
          className={`form-control ${validationError ? "is-invalid" : ""}`}
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          required
        />
        {validationError && (
          <div className="invalid-feedback">{validationError}</div>
        )}
      </div>

      <button type="submit" className="btn btn-primary">
        Add Location
      </button>
    </form>
  );
};

export default AddLocationForm;
