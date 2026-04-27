import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardTitle
} from "mdb-react-ui-kit";

const GeneratorForm = ({ onGeneratorAdded = null }) => {
  const [formData, setFormData] = useState({
    generator_no: "",
    generator_size: "",
    fuel_consumption: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");


   const generatorNoRegex = /^[A-Z]{1,3}\d{0,3}[A-Z]?(?:-?\d{1,3})?$/;
  const numberRegex = /^[0-9]+$/; 

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value); 
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "generator_no" && value) {
      if (!generatorNoRegex.test(value)) {
        error = "Format must be like ABM-01 (uppercase letters + hyphen + 2 digits)";
      }
    }

    if (name === "generator_size" && value) {
      if (!numberRegex.test(value) || parseInt(value, 10) <= 0) {
        error = "Size must be a positive number";
      }
    }

    if (name === "fuel_consumption" && value) {
      if (!numberRegex.test(value) || parseInt(value, 10) <= 0) {
        error = "Fuel consumption must be a positive number";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { generator_no, generator_size, fuel_consumption } = formData;

    if (!generatorNoRegex.test(generator_no)) {
      newErrors.generator_no = "Format must be like ABM-01";
    }

    if (!numberRegex.test(generator_size) || parseInt(generator_size, 10) <= 0) {
      newErrors.generator_size = "Size must be a positive number";
    }

    if (!numberRegex.test(fuel_consumption) || parseInt(fuel_consumption, 10) <= 0) {
      newErrors.fuel_consumption = "Fuel consumption must be a positive number";
    }

    if (generator_no && (!generator_size || !fuel_consumption)) {
      newErrors.generator_size = "Required if generator no is given";
      newErrors.fuel_consumption = "Required if generator no is given";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axiosInstance.post("/generators/", formData);

      if (onGeneratorAdded && typeof onGeneratorAdded === "function") {
        onGeneratorAdded(response.data);
      }

      setFormData({
        generator_no: "",
        generator_size: "",
        fuel_consumption: "",
      });

      setErrors({});
      setSuccessMessage("✅ Generator details added successfully!");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting generator form:", error.response?.data || error.message);
    }
  };

  return (
    <MDBCard
  className="p-4 shadow-sm bg-white mx-auto"
  style={{ marginTop: "30px", maxWidth: "900px" }}
>

      <MDBCardBody>
        <MDBCardTitle className="mb-4 text-primary fw-bold text-center">
          Add Generator
        </MDBCardTitle>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
         
          <div className="mb-3">
            <label htmlFor="generator_no" className="form-label">Generator No</label>
            <input
              type="text"
              id="generator_no"
              name="generator_no"
              value={formData.generator_no}
              onChange={handleChange}
              required
              className={`form-control ${errors.generator_no ? "is-invalid" : ""}`}
              placeholder="e.g., ABM-01"
            />
            {errors.generator_no && (
              <div className="invalid-feedback">{errors.generator_no}</div>
            )}
          </div>

         
          <div className="mb-3">
            <label htmlFor="generator_size" className="form-label">Generator Size</label>
            <input
              type="text"
              id="generator_size"
              name="generator_size"
              value={formData.generator_size}
              onChange={handleChange}
              required
              className={`form-control ${errors.generator_size ? "is-invalid" : ""}`}
              placeholder="Enter size (numbers only)"
            />
            {errors.generator_size && (
              <div className="invalid-feedback">{errors.generator_size}</div>
            )}
          </div>

          
          <div className="mb-4">
            <label htmlFor="fuel_consumption" className="form-label">Fuel Consumption</label>
            <input
              type="text"
              id="fuel_consumption"
              name="fuel_consumption"
              value={formData.fuel_consumption}
              onChange={handleChange}
              required
              className={`form-control ${errors.fuel_consumption ? "is-invalid" : ""}`}
              placeholder="Enter fuel consumption (numbers only)"
            />
            {errors.fuel_consumption && (
              <div className="invalid-feedback">{errors.fuel_consumption}</div>
            )}
          </div>

          <MDBBtn type="submit" color="primary" className="w-100">
            Submit
          </MDBBtn>
        </form>
      </MDBCardBody>
    </MDBCard>
  );
};

export default GeneratorForm;
