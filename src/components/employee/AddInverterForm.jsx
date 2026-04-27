
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBBtn,
  MDBTextArea,
} from "mdb-react-ui-kit";

const AddInverterForm = () => {
  const [formData, setFormData] = useState({
    unit_id: "",
    model: "",
    given_name: "",
    given_start_name: "",
    serial_no: "",
    inverter_status: "",
    remarks: "",
    link_to_installation: "",
  });

  const [statuses, setStatuses] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axiosInstance.get("/inverter-statuses/");
        setStatuses(response.data.results || []);
      } catch (error) {
        console.error("Failed to fetch inverter statuses", error);
      }
    };
    fetchStatuses();
  }, []);

  
  const validationRules = {
    unit_id: {
      regex: /^HZE\s*-\s*\d{2,5}\/\d{2,5}(?:-\d{2,5})?$/,
      example: "HZE - 176/300-079, HZE-10/46, or HZE-10/46-061",
    },
    model: {
      regex: /^\d{2,5}\/\d{2,5}$/,
      example: "176/300",
    },
    given_name: {
      regex: /^[A-Za-z0-9\s/-]{3,100}$/,
      example: "H79 176/300ALLYE UNIT",
    },
    given_start_name: {
      regex: /^[A-Za-z0-9\s]{2,15}$/,
      example: "H79",
    },
    serial_no: {
      regex: /^[A-Za-z0-9]+$|^NIL$/,
      example: "ABC123, 2422058, or NIL",
    },
    link_to_installation: {
      regex: /^(?:NIL|(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?)$/,
      example: "https://example.com/install OR NIL",
    },
  };


  const normalizeInput = (value, name) => {
    let val = value.replace(/[–—]/g, "-").replace(/\u00A0/g, " ");
    if (name === "serial_no") val = val.toUpperCase();
    return val;
  };

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = normalizeInput(value, name);

    setFormData((prev) => ({ ...prev, [name]: normalizedValue }));

    if (validationRules[name]) {
      const { regex, example } = validationRules[name];
      if (!regex.test(normalizedValue)) {
        setErrors((prev) => ({ ...prev, [name]: `Example: ${example}` }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {};

    Object.keys(validationRules).forEach((field) => {
      if (
        formData[field] &&
        !validationRules[field].regex.test(formData[field])
      ) {
        hasError = true;
        newErrors[field] = `Example: ${validationRules[field].example}`;
      }
    });
    setErrors(newErrors);

    if (hasError) return;

    try {
      const postData = {
        ...formData,
        given_name: formData.given_name.trim(),
        inverter_status_input: formData.inverter_status, 
      };
      delete postData.inverter_status;

      await axiosInstance.post("/inverters/", postData);
      alert("Inverter added successfully!");

      setFormData({
        unit_id: "",
        model: "",
        given_name: "",
        given_start_name: "",
        serial_no: "",
        inverter_status: "",
        remarks: "",
        link_to_installation: "",
      });
      setErrors({});
    } catch (error) {
      console.error(
        "Failed to add inverter:",
        error.response?.data || error.message
      );

      if (error.response?.data) {
        alert(
          `Failed to add inverter:\n${JSON.stringify(
            error.response.data,
            null,
            2
          )}`
        );
      } else {
        alert("Failed to add inverter. Please try again.");
      }
    }
  };

  return (
    <MDBCard className="my-5 mx-auto" style={{ maxWidth: "600px",marginTop: "80px"  }}>

  
      <MDBCardHeader className="bg-primary text-white text-center">
        <h4 className="fw-bold mb-0">Add Battery</h4>
      </MDBCardHeader>
      <MDBCardBody>
        <form onSubmit={handleSubmit}>
          {[
            { name: "unit_id", label: "Unit ID" },
            { name: "model", label: "Model" },
            { name: "given_name", label: "Given Name" },
            { name: "given_start_name", label: "Given Start Name" },
            { name: "serial_no", label: "Serial Number" },
            { name: "link_to_installation", label: "Link to Installation (Optional)" },
          ].map(({ name, label }) => (
            <div className="mb-3" key={name}>
              <label htmlFor={name} className="form-label">
                {label}
              </label>
              <input
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                required={name !== "link_to_installation"}
              />
              {errors[name] && (
                <div className="invalid-feedback">{errors[name]}</div>
              )}
            </div>
          ))}

          <div className="mb-3">
            <label htmlFor="inverter_status" className="form-label">
              Inverter Status
            </label>
            <select
              id="inverter_status"
              name="inverter_status"
              value={formData.inverter_status}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Inverter Status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.inverter_status_name}
                </option>
              ))}
            </select>
          </div>

         
          <div className="mb-4">
            <label htmlFor="remarks" className="form-label">
              Remarks
            </label>
            <MDBTextArea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="form-control"
            />
          </div>

          <MDBBtn type="submit" color="success" block>
            Submit
          </MDBBtn>
        </form>
      </MDBCardBody>
    </MDBCard>
  );
};

export default AddInverterForm;
