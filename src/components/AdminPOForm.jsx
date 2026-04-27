import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
} from "mdb-react-ui-kit";


const AdminPOForm = () => {
  const [poNumber, setPoNumber] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [location, setLocation] = useState("");
  const [inverter, setInverter] = useState("");
  const [inverter_id, setInverterId] = useState("");
  const [generator_no, setGeneratorNo] = useState("");
  const [generator_size, setGeneratorSize] = useState("");
  const [fuel_consumption, setFuel] = useState("");
  const [siteContact_name, setSiteContactName] = useState("");
  const [siteContact_email, setSiteContactEmail] = useState("");
  const [siteContact_number, setSiteContactNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({}); 
  const locationHook = useLocation();
  const navigate = useNavigate();



  const patterns = {
    poNumber: /^[A-Za-z0-9/\- ]+$/, 
    contractNumber: /^[A-Za-z0-9\-]+$/, 
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    contactNumber: /^[0-9]{7,15}$/, 
  };

 
const validateField = (name, value) => {
  let error = "";

  switch (name) {
    case "poNumber":
      if (!patterns.poNumber.test(value)) {
        error =
          "PO Number can only contain letters, digits, slashes (/), dashes (-), and spaces.";
      }
      break;
    case "contractNumber":
      if (!patterns.contractNumber.test(value)) {
        error =
          "Contract Number can only contain letters, digits, and dashes (-).";
      }
      break;
    case "clientEmail":
    case "siteContact_email":
      if (value && !patterns.email.test(value)) {
        error = "Invalid email format.";
      }
      break;
    case "siteContact_number":
      if (value && !patterns.contactNumber.test(value)) {
        error = "Contact number must be 7–15 digits.";
      }
      break;
    default:
      break;
  }


  if (generator_no) {
    if (!generator_size) {
      setErrors((prev) => ({
        ...prev,
        generator_size: "Generator Size is required when Generator No is provided.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, generator_size: "" }));
    }

    if (!fuel_consumption) {
      setErrors((prev) => ({
        ...prev,
        fuel_consumption: "Fuel Consumption is required when Generator No is provided.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, fuel_consumption: "" }));
    }
  }

 
  if (siteContact_name) {
    if (!siteContact_email) {
      setErrors((prev) => ({
        ...prev,
        siteContact_email: "Email is required when Site Contact Name is provided.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, siteContact_email: "" }));
    }

    if (!siteContact_number) {
      setErrors((prev) => ({
        ...prev,
        siteContact_number: "Number is required when Site Contact Name is provided.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, siteContact_number: "" }));
    }
  }

  setErrors((prev) => ({ ...prev, [name]: error }));
};


  useEffect(() => {
    const searchParams = new URLSearchParams(locationHook.search);
    const inverterFromQuery = searchParams.get("inverter");
    const inverterIdFromQuery = searchParams.get("inverter_id");
    if (inverterFromQuery) setInverter(inverterFromQuery);
    if (inverterIdFromQuery) setInverterId(inverterIdFromQuery);
  }, [locationHook.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

 
    if (!poNumber) return setErrorMsg("PO number is required.");
    if (!contractNumber) return setErrorMsg("Contract number is required.");
    if (!clientName) return setErrorMsg("Client name is required.");
    if (!startDate) return setErrorMsg("Start date is required.");

   
    if (endDate && new Date(startDate) > new Date(endDate)) {
      return setErrorMsg("End Date must be after Start Date.");
    }
    if (generator_no && (!generator_size || !fuel_consumption)) {
      return setErrorMsg(
        "If Generator No is entered, both Generator Size and Fuel Consumption are required."
      );
    }
    if (siteContact_name && (!siteContact_email || !siteContact_number)) {
      return setErrorMsg(
        "If Site Contact Name is entered, Email and Number are required."
      );
    }

    try {
      const token = localStorage.getItem("access_token");

   
      const clientResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/clients/`,
        {
          client_name: clientName,
          client_contact: clientContact || "",
          client_email: clientEmail || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clientId = clientResponse.data.id;
      const formattedEndDate = endDate
        ? new Date(endDate).toISOString().split("T")[0]
        : null;

   
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/orders/`,
        {
          po_number: poNumber,
          contract_no: contractNumber,
          issued_to: clientId,
          location: location || null,
          inverter_id: inverter_id || null,
          generator_no: generator_no || null,
          generator_size: generator_size || null,
          fuel_consumption: fuel_consumption || null,
          start_date: startDate,
          end_date: formattedEndDate,
          remarks: remarks || null,
          site_contact_name: siteContact_name || null,
          site_contact_email: siteContact_email || null,
          site_contact_number: siteContact_number || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("PO and client details added successfully!");
      // setTimeout(() => {
      //   window.location.href = `${import.meta.env.VITE_BASE_URL}/admin-dashboard`;
      // }, 1500);
      setTimeout(() => {
      navigate("/admin-dashboard");
    }, 1500);


      setPoNumber("");
      setContractNumber("");
      setClientName("");
      setClientContact("");
      setClientEmail("");
      setLocation("");
      setInverter("");
      setGeneratorNo("");
      setGeneratorSize("");
      setFuel("");
      setSiteContactName("");
      setSiteContactEmail("");
      setSiteContactNumber("");
      setStartDate("");
      setEndDate("");
      setRemarks("");
      setErrors({});
    } catch (error) {
      if (error.response) {
        console.error("Order creation failed:", error.response.data);
        setErrorMsg(
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data, null, 2)
        );
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <MDBCard className="p-4 shadow-sm bg-white">
      <MDBCardBody>
        <MDBCardTitle className="mb-4 text-primary fw-bold">
          Add PO & Client Details
        </MDBCardTitle>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
        
          <div className="mb-3">
            <label htmlFor="poNumber" className="form-label">
              PO Number<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="poNumber"
              className={`form-control ${
                errors.poNumber ? "is-invalid" : ""
              }`}
              value={poNumber}
              onChange={(e) => {
                setPoNumber(e.target.value);
                validateField("poNumber", e.target.value);
              }}
              required
            />
            {errors.poNumber && (
              <div className="invalid-feedback">{errors.poNumber}</div>
            )}
          </div>

       
          <div className="mb-3">
            <label htmlFor="contractNumber" className="form-label">
              Contract Number<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="contractNumber"
              className={`form-control ${
                errors.contractNumber ? "is-invalid" : ""
              }`}
              value={contractNumber}
              onChange={(e) => {
                setContractNumber(e.target.value);
                validateField("contractNumber", e.target.value);
              }}
              required
            />
            {errors.contractNumber && (
              <div className="invalid-feedback">{errors.contractNumber}</div>
            )}
          </div>

          <h5 className="mt-4 mb-2 text-dark">Client Info</h5>
          <div className="mb-3">
            <label htmlFor="clientName" className="form-label">
              Name<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="clientName"
              className="form-control"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="clientContact" className="form-label">
              Contact
            </label>
            <input
              type="text"
              id="clientContact"
              className="form-control"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="clientEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="clientEmail"
              className={`form-control ${
                errors.clientEmail ? "is-invalid" : ""
              }`}
              value={clientEmail}
              onChange={(e) => {
                setClientEmail(e.target.value);
                validateField("clientEmail", e.target.value);
              }}
            />
            {errors.clientEmail && (
              <div className="invalid-feedback">{errors.clientEmail}</div>
            )}
          </div>

   
          <div className="mb-3">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              id="location"
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="inverter" className="form-label">
              Inverter
            </label>
            <input
              type="text"
              id="inverter"
              className="form-control"
              value={inverter}
              onChange={(e) => setInverter(e.target.value)}
            />
          </div>

          
          <div className="mb-3">
            <label htmlFor="generator_no" className="form-label">
              Generator No
            </label>
            <input
              type="text"
              id="generator_no"
              className="form-control"
              value={generator_no}
              onChange={(e) => setGeneratorNo(e.target.value)}
            />
          </div>
         <div className="mb-3">
                <label htmlFor="generator_size" className="form-label">
                  Generator Size
                </label>
                <input
                  type="text"
                  id="generator_size"
                  className={`form-control ${errors.generator_size ? "is-invalid" : ""}`}
                  value={generator_size}
                  onChange={(e) => {
                    setGeneratorSize(e.target.value);
                    validateField("generator_size", e.target.value);
                  }}
                />
                {errors.generator_size && (
                  <div className="invalid-feedback">{errors.generator_size}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="fuel_consumption" className="form-label">
                  Fuel Consumption
                </label>
                <input
                  type="text"
                  id="fuel_consumption"
                  className={`form-control ${errors.fuel_consumption ? "is-invalid" : ""}`}
                  value={fuel_consumption}
                  onChange={(e) => {
                    setFuel(e.target.value);
                    validateField("fuel_consumption", e.target.value);
                  }}
                />
                {errors.fuel_consumption && (
                  <div className="invalid-feedback">{errors.fuel_consumption}</div>
                )}
              </div>


      
          <div className="mb-3">
            <label htmlFor="siteContact_name" className="form-label">
              Site Contact Name
            </label>
            <input
              type="text"
              id="siteContact_name"
              className="form-control"
              value={siteContact_name}
              onChange={(e) => setSiteContactName(e.target.value)}
            />
          </div>
          <div className="mb-3">
              <label htmlFor="siteContact_email" className="form-label">
                Site Contact Email
              </label>
              <input
                type="text"
                id="siteContact_email"
                className={`form-control ${errors.siteContact_email ? "is-invalid" : ""}`}
                value={siteContact_email}
                onChange={(e) => {
                  setSiteContactEmail(e.target.value);
                  validateField("siteContact_email", e.target.value);
                }}
              />
              {errors.siteContact_email && (
                <div className="invalid-feedback">{errors.siteContact_email}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="siteContact_number" className="form-label">
                Site Contact Number
              </label>
              <input
                type="text"
                id="siteContact_number"
                className={`form-control ${errors.siteContact_number ? "is-invalid" : ""}`}
                value={siteContact_number}
                onChange={(e) => {
                  setSiteContactNumber(e.target.value);
                  validateField("siteContact_number", e.target.value);
                }}
              />
              {errors.siteContact_number && (
                <div className="invalid-feedback">{errors.siteContact_number}</div>
              )}
            </div>

    
          <div className="mb-3">
            <label htmlFor="startDate" className="form-label">
              Start Date<span className="text-danger">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="endDate" className="form-label">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          
          <div className="mb-4">
            <label htmlFor="remarks" className="form-label">
              Remarks
            </label>
            <textarea
              id="remarks"
              className="form-control"
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <MDBBtn
            type="submit"
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
          >
            Hire
          </MDBBtn>
        </form>
      </MDBCardBody>
    </MDBCard>
  );
};

export default AdminPOForm;
