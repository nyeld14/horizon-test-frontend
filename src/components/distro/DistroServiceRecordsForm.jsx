import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const DistroServiceRecordsForm = ({ token }) => {
  const [formData, setFormData] = useState({
    service_token_number: "",
    distro: "",
    date_of_service: "",
    problem: "",
    repair_done: "",
    status: "",
    distance_travelled: "",
    hours_spent_on_travel: "",
    warranty_claim: "",
    hours_spent_on_site: "",
    base: "",
    service_location: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [distros, setDistros] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /* ---------------- VALIDATION ---------------- */

  const validationRules = {
    service_token_number: { regex: /^\d+$/, example: "Numeric only (e.g., 12345)" },
    problem: { regex: /^[A-Za-z0-9\s.,!@#$%^&*()\-_=+:'"?/\\|<>`~]+$/, example: "Letters, numbers, symbols allowed" },
    repair_done: { regex: /^[A-Za-z0-9\s\W]+$/, example: "Alphanumeric + symbols" },
    distance_travelled: { regex: /^\d+(\.\d{1,2})?$/, example: "Numeric (e.g., 10.50)" },
    hours_spent_on_travel: { regex: /^\d+$/, example: "Numeric only" },
    warranty_claim: { regex: /^[A-Za-z0-9\s]+$/, example: "Alphanumeric" },
    hours_spent_on_site: { regex: /^\d+$/, example: "Numeric only" },
    base: { regex: /^[A-Za-z0-9\s]+$/, example: "Alphanumeric" },
    service_location: { regex: /^[A-Za-z0-9\s]+$/, example: "Alphanumeric" },
  };

const requiredFields = [
  "service_token_number",
  "distro",
  "date_of_service",
  "status",
  "problem",
  "repair_done",
  "hours_spent_on_travel",
  "warranty_claim",
  "hours_spent_on_site",
  "base",
  "service_location",
];


 const validateField = (name, value) => {

  // Special rule for Hours Spent on Site
  if (name === "hours_spent_on_site") {
    if (!value || !/^\d+$/.test(value)) {
      return "Numeric only";
    }
    return "";
  }

  if (requiredFields.includes(name) && !value) {
    return "This field is required";
  }

  if (validationRules[name]) {
    const { regex, example } = validationRules[name];
    if (value && !regex.test(value)) {
      return `Example: ${example}`;
    }
  }

  return "";
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

 const validateForm = () => {
  const errors = {};
  requiredFields.forEach((field) => {
    const err = validateField(field, formData[field]);
    if (err) errors[field] = err;
  });
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

  /* ---------------- SORT ---------------- */

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
    );
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let A = a[sortConfig.key] || "";
    let B = b[sortConfig.key] || "";
    if (sortConfig.key === "date_of_service") {
      A = new Date(a.date_of_service);
      B = new Date(b.date_of_service);
    }
    return A < B ? (sortConfig.direction === "asc" ? -1 : 1) : A > B ? (sortConfig.direction === "asc" ? 1 : -1) : 0;
  });

  /* ---------------- API ---------------- */

  useEffect(() => {
    axiosInstance.get("/distro/distros/", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDistros(res.data.results ||  res.data));
    axiosInstance.get("/distro/service-statuses/", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStatuses(res.data.results || []));
    fetchRecords(currentPage);
  }, [token, currentPage]);

  const fetchRecords = (page, search = "") => {
    axiosInstance.get(`/distro/service-records/?page=${page}&search=${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setRecords(res.data.results || []);
      setCount(res.data.count || 0);
    });
  };

  /* ---------------- CRUD ---------------- */

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    ...formData,
    distance_travelled:
      formData.distance_travelled === "" ? null : formData.distance_travelled,
  };

  const req = editingId
    ? axiosInstance.put(`/distro/service-records/${editingId}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
    : axiosInstance.post(`/distro/service-records/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

  req.then(() => {
    alert("✅ Distro service record saved");
    resetForm();
    fetchRecords(currentPage);
  });
};


  const resetForm = () => {
    setFormData({
      service_token_number: "",
      distro: "",
      date_of_service: "",
      problem: "",
      repair_done: "",
      status: "",
      distance_travelled: "",
      hours_spent_on_travel: "",
      warranty_claim: "",
      hours_spent_on_site: "",
      base: "",
      service_location: "",
    });
    setEditingId(null);
    setFormErrors({});
  };

  const handleEdit = (r) => {
    setFormData({
      service_token_number: r.service_token_number,
      distro: r.distro,   // ✅ correct FK
      date_of_service: r.date_of_service,
      problem: r.problem,
      repair_done: r.repair_done,
      status: r.status,
      distance_travelled: r.distance_travelled || "",
      hours_spent_on_travel: r.hours_spent_on_travel || "",
      warranty_claim: r.warranty_claim || "",
      hours_spent_on_site: r.hours_spent_on_site || "",
      base: r.base || "",
      service_location: r.service_location || "",
    });
    setEditingId(r.id);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this record?")) return;
    axiosInstance.delete(`/distro/service-records/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchRecords(currentPage));
  };

  /* ---------------- UI ---------------- */

  return (
     <div className="max-w-7xl mx-auto mt-10 px-4"
     style={{ marginTop: "80px" }} >
      
      <h3>🔧 Distro Service Records</h3>

      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="row mb-2">
         
          <div className="col">
              <label className="form-label fw-bold">Token No</label>
            
                          <input  
                className={`form-control ${formErrors.service_token_number ? "is-invalid" : ""}`}
                name="service_token_number"
                value={formData.service_token_number}
                onChange={handleChange}
                
              />
              {formErrors.service_token_number && (
                <div className="invalid-feedback">{formErrors.service_token_number}</div>
              )}

          </div>

          <div className="col">
             <label className="form-label fw-bold">Distro</label>
            <select
                className={`form-select ${formErrors.distro ? "is-invalid" : ""}`}
                name="distro"
                value={formData.distro}
                onChange={handleChange}
              >
                <option value="">Select Distro</option>
                {distros.map(d => (
                  <option key={d.id} value={d.id}>{d.given_name}</option>
                ))}
              </select>
              {formErrors.distro && (
                <div className="invalid-feedback">{formErrors.distro}</div>
              )}

          </div>

          <div className="col">
            <label className="form-label fw-bold">Date of Service</label>
           <input
                          type="date"
                          className={`form-control ${formErrors.date_of_service ? "is-invalid" : ""}`}
                          name="date_of_service"
                          value={formData.date_of_service}
                          onChange={handleChange}
                        />
                        {formErrors.date_of_service && (
                          <div className="invalid-feedback">{formErrors.date_of_service}</div>
                        )}

          </div>

          <div className="col">
            <label className="form-label fw-bold">Status</label>
            <select
              className={`form-select ${formErrors.status ? "is-invalid" : ""}`}
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Status</option>
              {statuses.map(s => (
                <option key={s.id} value={s.id}>{s.service_status_name}</option>
              ))}
            </select>
            {formErrors.status && (
              <div className="invalid-feedback">{formErrors.status}</div>
            )}

          </div>
        </div>
        
            <label className="form-label fw-bold">Active Issue</label>

                    <textarea
              className={`form-control ${formErrors.problem ? "is-invalid" : ""}`}
              name="problem"
              value={formData.problem}
              onChange={handleChange}
            />
            {formErrors.problem && (
              <div className="invalid-feedback">{formErrors.problem}</div>
            )}

        
        
            <label className="form-label fw-bold">Rectified Issue</label>

        <textarea
  className={`form-control ${formErrors.repair_done ? "is-invalid" : ""}`}
  name="repair_done"
  value={formData.repair_done}
  onChange={handleChange}
/>
{formErrors.repair_done && (
  <div className="invalid-feedback">{formErrors.repair_done}</div>
)}


        <div className="row mb-2">
          <div className="col">
            
            <label className="form-label fw-bold">Distance Travelled</label>
<input
  className={`form-control ${formErrors.distance_travelled ? "is-invalid" : ""}`}
  name="distance_travelled"
  value={formData.distance_travelled}
  onChange={handleChange}
/>
{formErrors.distance_travelled && (
  <div className="invalid-feedback">{formErrors.distance_travelled}</div>
)}
          </div>
          <div className="col">

             <label className="form-label fw-bold">Hours Spent on Travel</label>
<input
  className={`form-control ${formErrors.hours_spent_on_travel ? "is-invalid" : ""}`}
  name="hours_spent_on_travel"
  value={formData.hours_spent_on_travel}
  onChange={handleChange}
/>
{formErrors.hours_spent_on_travel && (
  <div className="invalid-feedback">{formErrors.hours_spent_on_travel}</div>
)}
            </div>
          <div className="col">
            <label className="form-label fw-bold">Warranty Claim</label>
<input
  className={`form-control ${formErrors.warranty_claim ? "is-invalid" : ""}`}
  name="warranty_claim"
  value={formData.warranty_claim}
  onChange={handleChange}
/>
{formErrors.warranty_claim && (
  <div className="invalid-feedback">{formErrors.warranty_claim}</div>
)}
            </div>
        </div>

        <div className="row mb-2">
          <div className="col">
            <label className="form-label fw-bold">Hours Spent on Site</label>
            <input
              className={`form-control ${formErrors.hours_spent_on_site ? "is-invalid" : ""}`}
              name="hours_spent_on_site"
              placeholder="Hours on Site"
              value={formData.hours_spent_on_site}
              onChange={handleChange}
            />
            {formErrors.hours_spent_on_site && (
              <div className="invalid-feedback">{formErrors.hours_spent_on_site}</div>
            )}
            </div>
          <div className="col">
            <label className="form-label fw-bold">Base</label>
            <input
              className={`form-control ${formErrors.base ? "is-invalid" : ""}`}
              name="base"
              placeholder="Base"
              value={formData.base}
              onChange={handleChange}
            />
            {formErrors.base && (
              <div className="invalid-feedback">{formErrors.base}</div>
            )}
            </div>
          <div className="col">

            <label className="form-label fw-bold">Location</label>
            <input
              className={`form-control ${formErrors.service_location ? "is-invalid" : ""}`}
              name="service_location"
              placeholder="Service Location"
              value={formData.service_location}
              onChange={handleChange}
            />
            {formErrors.service_location && (
              <div className="invalid-feedback">{formErrors.service_location}</div>
            )}
            </div>
        </div>

              <div className="d-flex gap-2">
          <button className="btn btn-primary" type="submit">
            {editingId ? "Update" : "Add"} Record
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>

      </form>

      <input className="form-control mb-3" placeholder="Search..." value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); fetchRecords(1, e.target.value); }} />

      <table className="table table-bordered text-center">
        <thead>
          <tr>
            <th onClick={() => handleSort("service_token_number")}>Token</th>
            <th onClick={() => handleSort("distro_name")}>Distro</th>
            <th onClick={() => handleSort("date_of_service")}>Date</th>
            <th>Problem</th>
            <th>Repair</th>
            <th>Status</th>
            <th>Distance</th>
            <th>Travel Hr</th>
            <th>Warranty</th>
            <th>Site Hr</th>
            <th>Base</th>
            <th>Location</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map(r => (
            <tr key={r.id}>
              <td>{r.service_token_number}</td>
              <td>{r.distro_name}</td>
              <td>{r.date_of_service}</td>
              <td>{r.problem}</td>
              <td>{r.repair_done}</td>
              <td>{r.status_name}</td>
              <td>{r.distance_travelled || "-"}</td>
              <td>{r.hours_spent_on_travel || "-"}</td>
              <td>{r.warranty_claim || "-"}</td>
              <td>{r.hours_spent_on_site || "-"}</td>
              <td>{r.base || "-"}</td>
              <td>{r.service_location || "-"}</td>
              <td><button className="btn btn-sm btn-info" onClick={() => handleEdit(r)}>✏</button></td>
              <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>🗑</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DistroServiceRecordsForm;
