import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBBtn,
  MDBTextArea,
} from "mdb-react-ui-kit";

const AddDistroForm = () => {
  const [formData, setFormData] = useState({
    distro_id: "",
    serial_no: "",
    distro_status: "",
    remarks: "",
    link_to_installation: "",
  });

  const [statuses, setStatuses] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ============================
     Load Distro Statuses
  ============================ */
  useEffect(() => {
    axiosInstance
      .get("/distro/distro-statuses/")
      .then((res) => setStatuses(res.data.results || res.data))
      .catch((err) =>
        console.error("Failed to fetch distro statuses", err.response?.data || err.message)
      );
  }, []);

  /* ============================
     Validation Rules
  ============================ */
  const validationRules = {
    distro_id: {
      regex: /^Horizon Distro-\d{2}$/,
      example: "Horizon Distro-01",
    },
    serial_no: {
      regex: /^[A-Z]{2}\d{6}$/,
      example: "ES012365",
    },
    link_to_installation: {
      regex:
        /^(NIL|(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?)$/,
      example: "https://example.com/install OR NIL",
    },
  };

  /* ============================
     Build Given Name
  ============================ */
  const buildGivenName = () => {
    const statusName =
      statuses.find((s) => String(s.id) === String(formData.distro_status))
        ?.distro_status_name || "";

    if (!formData.distro_id || !formData.serial_no || !statusName) return "";

    return `${formData.distro_id} ${formData.serial_no} ${statusName}`;
  };

  const normalizeInput = (value, name) => {
    let v = value.replace(/[–—]/g, "-").replace(/\u00A0/g, " ").trim();
    if (name === "serial_no") v = v.toUpperCase();
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalized = normalizeInput(value, name);

    setFormData((prev) => ({ ...prev, [name]: normalized }));

    if (validationRules[name]) {
      const { regex, example } = validationRules[name];
      if (!regex.test(normalized)) {
        setErrors((prev) => ({ ...prev, [name]: `Example: ${example}` }));
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    }
  };

  /* ============================
     Submit
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.distro_id || !formData.serial_no || !formData.distro_status) {
      alert("Please fill Distro ID, Serial Number and Status");
      return;
    }

    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      if (formData[field] && !validationRules[field].regex.test(formData[field])) {
        newErrors[field] = `Example: ${validationRules[field].example}`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const payload = {
        distro_id: formData.distro_id,
        serial_no: formData.serial_no,
        given_name: buildGivenName(),
        distro_status_input: formData.distro_status,
        remarks: formData.remarks || "NIL",
        link_to_installation: formData.link_to_installation || "NIL",
      };

      await axiosInstance.post("/distro/distros/", payload);

      alert("✅ Distro unit added successfully!");

      setFormData({
        distro_id: "",
        serial_no: "",
        distro_status: "",
        remarks: "",
        link_to_installation: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Distro add failed:", error.response?.data || error.message);
      alert("❌ Failed to add distro unit");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     Render
  ============================ */
  return (
    <MDBCard className="my-5 mx-auto shadow-sm" style={{ maxWidth: "600px",marginTop: "80px" }}>
      <MDBCardHeader className="bg-primary text-white text-center">
        <h4 className="fw-bold mb-0">➕ Add Distro Unit</h4>
      </MDBCardHeader>

      <MDBCardBody>
        <form onSubmit={handleSubmit}>
          {[
            { name: "distro_id", label: "Distro ID" },
            { name: "serial_no", label: "Serial Number" },
            { name: "link_to_installation", label: "Link to Installation (or NIL)" },
          ].map(({ name, label }) => (
            <div className="mb-3" key={name}>
              <label className="form-label fw-semibold">{label}</label>
              <input
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
            <label className="form-label fw-semibold">Given Name</label>
            <input className="form-control bg-light" value={buildGivenName()} readOnly />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Distro Status</label>
            <select
              name="distro_status"
              value={formData.distro_status}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Select Status --</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.distro_status_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Remarks</label>
            <MDBTextArea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <MDBBtn type="submit" color="success" block disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </MDBBtn>
        </form>
      </MDBCardBody>
    </MDBCard>
  );
};

export default AddDistroForm;
