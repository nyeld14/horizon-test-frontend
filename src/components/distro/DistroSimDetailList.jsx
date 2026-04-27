import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
} from "mdb-react-ui-kit";

/* ================= VALIDATION CONFIG ================= */

const validationRules = {
  phone_number: {
    regex: /^\d{5,15}$/,
    example: "5–15 digits only",
  },
  serial_no: {
    regex: /^\d+$/,
    example: "Digits only (e.g., 123456)",
  },
  user_no: {
    regex: /^[A-Za-z0-9-]+$/,
    example: "Alphanumeric with hyphen (e.g., User-1)",
  },
  remarks: {
    regex: /^[A-Za-z0-9\s!@#$%^&*(),/.?":{}|<>_-]*$/,
    example: "Alphanumeric + spaces + special characters",
  },
};

const requiredFields = [
  "distro",
  "phone_number",
  "serial_no",
  "user_no",
  "installation_date",
];

const validateField = (name, value) => {
  if (validationRules[name]) {
    const { regex, example } = validationRules[name];
    if (value && !regex.test(value)) {
      return `Example: ${example}`;
    }
  }
  return "";
};

/* ================= COMPONENT ================= */

const DistroSimDetailList = () => {
  const [sims, setSims] = useState([]);
  const [distros, setDistros] = useState([]);

  const [formData, setFormData] = useState({
    distro: "",
    phone_number: "",
    serial_no: "",
    user_no: "",
    installation_date: "",
    remarks: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDistros();
    fetchSims();
  }, []);

  const fetchDistros = async () => {
    const res = await axiosInstance.get("/distro/distros/");
    setDistros(res.data.results || res.data);
  };

  const fetchSims = async () => {
    const res = await axiosInstance.get("/distro/sim-details/");
    setSims(res.data.results || res.data);
  };

  /* ================= ADD FORM ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: validateField(name, value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    Object.keys(validationRules).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length) {
      setFormErrors(newErrors);
      return;
    }

    await axiosInstance.post("/distro/sim-details/", formData);

    setFormData({
      distro: "",
      phone_number: "",
      serial_no: "",
      user_no: "",
      installation_date: "",
      remarks: "",
    });
    setFormErrors({});
    fetchSims();
  };

  /* ================= EDIT MODE ================= */

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    setEditErrors({ ...editErrors, [name]: validateField(name, value) });
  };

  const handleSave = async () => {
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!editData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    Object.keys(validationRules).forEach((field) => {
      const err = validateField(field, editData[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length) {
      setEditErrors(newErrors);
      return;
    }

    await axiosInstance.put(
      `/distro/sim-details/${editingId}/`,
      editData
    );

    setEditingId(null);
    setEditData({});
    setEditErrors({});
    fetchSims();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setEditErrors({});
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Delete this SIM?")) return;
    await axiosInstance.delete(`/distro/sim-details/${id}/`);
    fetchSims();
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto px-4" style={{ marginTop: "80px" }}>
      {/* ADD SIM */}
      <MDBCard className="mb-4">
        <MDBCardBody>
          <MDBCardTitle>➕ Add Distro SIM</MDBCardTitle>

          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <select
                className={`form-select ${formErrors.distro ? "is-invalid" : ""}`}
                name="distro"
                value={formData.distro}
                onChange={handleChange}
                required
              >
                <option value="">Select Distro</option>
                {distros.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.serial_no} - {d.given_name}
                  </option>
                ))}
              </select>
              {formErrors.distro && (
                <div className="invalid-feedback">{formErrors.distro}</div>
              )}
            </div>

            {["phone_number", "serial_no", "user_no"].map((f) => (
              <div className="col-md-2" key={f}>
                <input
                  name={f}
                  value={formData[f]}
                  onChange={handleChange}
                  className={`form-control ${formErrors[f] ? "is-invalid" : ""}`}
                  placeholder={f.replace("_", " ").toUpperCase()}
                  required
                />
                {formErrors[f] && (
                  <div className="invalid-feedback">{formErrors[f]}</div>
                )}
              </div>
            ))}

            <div className="col-md-2">
              <input
                type="date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                className={`form-control ${
                  formErrors.installation_date ? "is-invalid" : ""
                }`}
                required
              />
            </div>

            <div className="col-md-3">
              <input
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className={`form-control ${formErrors.remarks ? "is-invalid" : ""}`}
                placeholder="Remarks"
              />
              {formErrors.remarks && (
                <div className="invalid-feedback">{formErrors.remarks}</div>
              )}
            </div>

            <div className="col-md-2">
              <button className="btn btn-primary w-100">Add</button>
            </div>
          </form>
        </MDBCardBody>
      </MDBCard>

      {/* LIST */}
      <MDBCard>
        <MDBCardBody>
          <MDBCardTitle>📋 Distro SIMs</MDBCardTitle>

          <MDBTable bordered hover>
            <MDBTableHead>
              <tr>
                <th>#</th>
                <th>Distro</th>
                <th>Phone</th>
                <th>SIM Serial</th>
                <th>User No</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </MDBTableHead>

            <MDBTableBody>
              {sims.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>

                  {editingId === s.id ? (
                    <>
                      <td>
                        <select
                          name="distro"
                          value={editData.distro || ""}
                          onChange={handleEditChange}
                          className={`form-select ${
                            editErrors.distro ? "is-invalid" : ""
                          }`}
                          required
                        >
                          <option value="">Select</option>
                          {distros.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.serial_no}
                            </option>
                          ))}
                        </select>
                        {editErrors.distro && (
                          <div className="invalid-feedback">
                            {editErrors.distro}
                          </div>
                        )}
                      </td>

                      {["phone_number", "serial_no", "user_no", "remarks"].map(
                        (f) => (
                          <td key={f}>
                            <input
                              name={f}
                              value={editData[f] || ""}
                              onChange={handleEditChange}
                              className={`form-control ${
                                editErrors[f] ? "is-invalid" : ""
                              }`}
                              required={f !== "remarks"}
                            />
                            {editErrors[f] && (
                              <div className="invalid-feedback">
                                {editErrors[f]}
                              </div>
                            )}
                          </td>
                        )
                      )}

                      <td>
                        <input
                          type="date"
                          name="installation_date"
                          value={editData.installation_date || ""}
                          onChange={handleEditChange}
                          className={`form-control ${
                            editErrors.installation_date ? "is-invalid" : ""
                          }`}
                          required
                        />
                        {editErrors.installation_date && (
                          <div className="invalid-feedback">
                            {editErrors.installation_date}
                          </div>
                        )}
                      </td>

                      <td className="d-flex gap-2">
                            <MDBBtn size="sm" color="success" onClick={handleSave}>
                              Save
                            </MDBBtn>

                            <MDBBtn
                              size="sm"
                              color="secondary"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </MDBBtn>
                          </td>

                    </>
                  ) : (
                    <>
                      <td>
                        {s.distro_serial} - {s.distro_name}
                      </td>
                      <td>{s.phone_number}</td>
                      <td>{s.serial_no}</td>
                      <td>{s.user_no}</td>
                      <td>{s.installation_date}</td>
                      <td>{s.remarks}</td>
                      <td>
                        <MDBBtn
                          size="sm"
                          color="info"
                          onClick={() => {
                            setEditingId(s.id);
                            setEditData(s);
                            setEditErrors({});
                          }}
                        >
                          ✏
                        </MDBBtn>{" "}
                        <MDBBtn
                          size="sm"
                          color="danger"
                          onClick={() => handleDelete(s.id)}
                        >
                          🗑
                        </MDBBtn>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default DistroSimDetailList;
