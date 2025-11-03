import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const ServiceRecordsForm = ({ token }) => {
  const [formData, setFormData] = useState({
    service_token_number: "",
    inverter_id: "",
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
  const [inverters, setInverters] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");


  // ✅ Regex rules
  const validationRules = {
    service_token_number: { regex: /^\d+$/, example: "Numeric only (e.g., 12345)" },
    problem: {
  regex: /^[A-Za-z0-9\s.,!@#\$%\^&\*\(\)\-_+=:;'"?/\\|<>`~]+$/,
  example: "Letters, numbers, spaces, and symbols allowed"
   },
   repair_done: { regex: /^[A-Za-z0-9\s\W]+$/, example: "Alphabets, numbers, and special characters allowed" },
  distance_travelled: {
  regex: /^\d+(\.\d{1,2})?$/, // only allows 0, 1 or 2 decimals
  example: "Numeric (e.g., 100 or 15.60)"
},
  hours_spent_on_travel: { regex: /^\d+$/, example: "Numeric only (e.g., 5)" },
    warranty_claim: { regex: /^[A-Za-z0-9\s]+$/, example: "Alphanumeric (e.g., Yes123)" },
    hours_spent_on_site: { regex: /^\d+$/, example: "Numeric only (e.g., 8)" },
    base: { regex: /^[A-Za-z0-9\s]+$/, example: "Alphanumeric only" },
    service_location: { regex: /^[A-Za-z0-9\s]+$/, example: "Alphanumeric only" },
  };

  const validateField = (name, value) => {
    if (validationRules[name]) {
      const { regex, example } = validationRules[name];
      if (value && !regex.test(value)) {
        return `Example: ${example}`;
      }
    }
    return "";
  };
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
const handleSort = (key) => {
  setSortConfig((prev) => {
    if (prev.key === key) {
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    }
    return { key, direction: 'asc' };
  });
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch inverters + statuses + records
  useEffect(() => {
    axiosInstance.get("inverters/", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setInverters(res.data.results || []));
    axiosInstance.get("service-statuses/", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStatuses(res.data.results || []));
    fetchRecords(currentPage);
  }, [token, currentPage]);

  const fetchRecords = (page, search = "") => {
  axiosInstance
    .get(`service-records/?page=${page}&search=${search}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then((res) => {
      setRecords(res.data.results || []);
      setCount(res.data.count || 0);
    });
};


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return; // ❌ Block submit if invalid

    const request = editingId
      ? axiosInstance.put(`service-records/${editingId}/`, formData, { headers: { Authorization: `Bearer ${token}` } })
      : axiosInstance.post("service-records/", formData, { headers: { Authorization: `Bearer ${token}` } });

    request
      .then(() => {
        alert("✅ Service record saved successfully");
        setFormData({
          service_token_number: "",
          inverter_id: "",
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
        fetchRecords(currentPage);
      })
      .catch((err) => console.error("Error:", err.response?.data || err.message));
  };
  const sortedRecords = [...records].sort((a, b) => {
  if (!sortConfig.key) return 0;

  let valA, valB;

  if (sortConfig.key === "date_of_service") {
    valA = new Date(a.date_of_service);
    valB = new Date(b.date_of_service);
  } else {
    valA = a[sortConfig.key] || "";
    valB = b[sortConfig.key] || "";
  }

  if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
  if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
  return 0;
});

  const handleEdit = (record) => {
    setFormData({
      ...record,
      inverter_id: record.inverter_id,
      status: record.status,
      date_of_service: record.date_of_service ? record.date_of_service.split("T")[0] : "",
    });
    setEditingId(record.id);
  };

  const handleDelete = (id) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;

  axiosInstance
    .delete(`service-records/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      alert("🗑️ Record deleted successfully");
      fetchRecords(currentPage);
    })
    .catch((err) => {
      console.error("Delete error:", err.response?.data || err.message);
      alert("❌ Failed to delete record");
    });
};


  return (
    <div className="container my-4">
      <h2 className="h4 mb-4">🔧 Add or Update Service Record</h2>

      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <table className="table table-borderless">
          <tbody>
            <tr>
              <td><label>Service Token Number</label></td>
              <td>
                <input
                  name="service_token_number"
                  value={formData.service_token_number}
                  onChange={handleChange}
                  className={`form-control ${formErrors.service_token_number ? "is-invalid" : ""}`}
                />
                {formErrors.service_token_number && (
                  <div className="invalid-feedback">{formErrors.service_token_number}</div>
                )}
              </td>
              <td><label>Inverter</label></td>
              <td>
                <select
                  name="inverter_id"
                  value={formData.inverter_id}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select Inverter --</option>
                  {inverters.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.unit_id}</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td><label>Date of Service</label></td>
              <td>
                <input
                  type="date"
                  name="date_of_service"
                  value={formData.date_of_service}
                  onChange={handleChange}
                  className="form-control"
                />
              </td>
              <td><label>Status</label></td>
              <td>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select Status --</option>
                  {statuses.map((stat) => (
                    <option key={stat.id} value={stat.id}>{stat.service_status_name}</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td><label>Active Issue</label></td>
              <td>
                <textarea
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  className={`form-control ${formErrors.problem ? "is-invalid" : ""}`}
                />
                {formErrors.problem && (
                  <div className="invalid-feedback">{formErrors.problem}</div>
                )}
              </td>
              <td><label>Rectified Issue</label></td>
              <td>
                <input
                  name="repair_done"
                  value={formData.repair_done}
                  onChange={handleChange}
                  className={`form-control ${formErrors.repair_done ? "is-invalid" : ""}`}
                />
                {formErrors.repair_done && (
                  <div className="invalid-feedback">{formErrors.repair_done}</div>
                )}
              </td>
            </tr>

            <tr>
              <td><label>Distance Travelled (Km)</label></td>
              <td>
                <input
                  name="distance_travelled"
                  value={formData.distance_travelled}
                  onChange={handleChange}
                  className={`form-control ${formErrors.distance_travelled ? "is-invalid" : ""}`}
                />
                {formErrors.distance_travelled && (
                  <div className="invalid-feedback">{formErrors.distance_travelled}</div>
                )}
              </td>
              <td><label>Hours on Travel (Hrs)</label></td>
              <td>
                <input
                  name="hours_spent_on_travel"
                  value={formData.hours_spent_on_travel}
                  onChange={handleChange}
                  className={`form-control ${formErrors.hours_spent_on_travel ? "is-invalid" : ""}`}
                />
                {formErrors.hours_spent_on_travel && (
                  <div className="invalid-feedback">{formErrors.hours_spent_on_travel}</div>
                )}
              </td>
            </tr>

            <tr>
              <td><label>Warranty Claim</label></td>
              <td>
                <input
                  name="warranty_claim"
                  value={formData.warranty_claim}
                  onChange={handleChange}
                  className={`form-control ${formErrors.warranty_claim ? "is-invalid" : ""}`}
                />
                {formErrors.warranty_claim && (
                  <div className="invalid-feedback">{formErrors.warranty_claim}</div>
                )}
              </td>
              <td><label>Hours on Site (Hrs)</label></td>
              <td>
                <input
                  name="hours_spent_on_site"
                  value={formData.hours_spent_on_site}
                  onChange={handleChange}
                  className={`form-control ${formErrors.hours_spent_on_site ? "is-invalid" : ""}`}
                />
                {formErrors.hours_spent_on_site && (
                  <div className="invalid-feedback">{formErrors.hours_spent_on_site}</div>
                )}
              </td>
            </tr>

            <tr>
              <td><label>Base</label></td>
              <td>
                <input
                  name="base"
                  value={formData.base}
                  onChange={handleChange}
                  className={`form-control ${formErrors.base ? "is-invalid" : ""}`}
                />
                {formErrors.base && (
                  <div className="invalid-feedback">{formErrors.base}</div>
                )}
              </td>
              <td><label>Given Name/ Location</label></td>
              <td>
                <input
                  name="service_location"
                  value={formData.service_location}
                  onChange={handleChange}
                  className={`form-control ${formErrors.service_location ? "is-invalid" : ""}`}
                />
                {formErrors.service_location && (
                  <div className="invalid-feedback">{formErrors.service_location}</div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-end mt-3">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Update" : "Add"} Service Record
          </button>
        </div>
      </form>

    <div className="d-flex justify-content-between align-items-center mb-3">
  <input
    type="text"
    placeholder="🔍 Search by token, inverter, status, repair, problem..."
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      fetchRecords(1, e.target.value); 
      setCurrentPage(1);
    }}
    className="form-control w-50"
  />
</div>


      <h3 className="h5 mb-3">📋 Service Records List</h3>

      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center">
         <thead className="table-light">
              <tr>
                <th onClick={() => handleSort("service_token_number")} style={{ cursor: "pointer" }}>
                  Token {sortConfig.key === "service_token_number" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("inverter_name")} style={{ cursor: "pointer" }}>
                  Inverter {sortConfig.key === "inverter_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("date_of_service")} style={{ cursor: "pointer" }}>
                  Service Date {sortConfig.key === "date_of_service" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
                <th>Problem</th>
                <th>Repair</th>
                <th>Status</th>
                <th>Distance Travelled (KM)</th>
                <th>Hours on Travel(Hr)</th>
                <th>Warranty Claim</th>
                <th>Hours on Site(Hr)</th>
                <th>Base</th>
                <th>Given Name / Location</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

          <tbody>
            {sortedRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.service_token_number}</td>
                <td>{record.inverter_name}</td>
                <td>{new Date(record.date_of_service).toLocaleDateString()}</td>
                <td>{record.problem}</td>
                <td>{record.repair_done}</td>
                <td>{record.status_name}</td>
                <td>{record.distance_travelled || '-'}</td>
                <td>{record.hours_spent_on_travel || '-'}</td>
                <td>{record.warranty_claim || '-'}</td>
                <td>{record.hours_spent_on_site || '-'}</td>
                <td>{record.base || '-'}</td>
                <td>{record.service_location || '-'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(record)}
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="fas fa-pen"></i>

                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                     <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(count / pageSize) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`btn btn-sm ${
              currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceRecordsForm;
