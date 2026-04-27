import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const DistroOrderForm = () => {
  const [orders, setOrders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [distros, setDistros] = useState([]);

  const [formData, setFormData] = useState({
    distro_po_number: "",
    client_name: "",
    client_contact: "",
    client_email: "",
    location_id: "",
    distro_id: "",
    start_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOrders();
    fetchLocations();
    fetchDistros();
  }, []);

  const fetchOrders = async () => {
    const res = await axiosInstance.get("/distro/orders/");
    setOrders(res.data.results || res.data);
  };

  const fetchLocations = async () => {
    const res = await axiosInstance.get("/distro/locations/");
    setLocations(res.data.results || res.data);
  };

  const fetchDistros = async () => {
    const res = await axiosInstance.get("/distro/distros/");
    setDistros(res.data.results || res.data);
  };

  // -------------------
  // Input handler
  // -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone: digits only, max 15
    if (name === "client_contact") {
      const digits = value.replace(/\D/g, "");
      if (digits.length > 15) return;
      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------
  // Frontend validation
  // -------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = "Client name is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (formData.client_contact) {
      if (formData.client_contact.length < 10) {
        newErrors.client_contact = "Contact number must be at least 10 digits";
      }
      if (formData.client_contact.length > 15) {
        newErrors.client_contact = "Contact number cannot exceed 15 digits";
      }
    }

    if (formData.client_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.client_email)) {
        newErrors.client_email = "Enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------
  // Submit
  // -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
  distro_po_number: formData.distro_po_number,
  client_name: formData.client_name,
  client_contact: formData.client_contact || "",
  client_email: formData.client_email || "",
  start_date: formData.start_date,
  end_date: formData.end_date || null,

  // 🔥 IMPORTANT: map *_id → actual API fields
  distro: formData.distro_id,
  location: formData.location_id,
};


    try {
      await axiosInstance.post("/distro/orders/", payload);
      alert("✅ Distro Order Created");

      setFormData({
        distro_po_number: "",
        client_name: "",
        client_contact: "",
        client_email: "",
        location_id: "",
        distro_id: "",
        start_date: "",
        end_date: "",
      });

      setErrors({});
      fetchOrders();
    } catch (err) {
      const apiErrors = err.response?.data || {};
      setErrors(apiErrors);
      console.error(apiErrors);
      alert("❌ Validation error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4"
     style={{ marginTop: "80px" }} >
      <h4>📦 Distro Order</h4>

      <form onSubmit={handleSubmit}>
        <table className="table table-bordered table-sm">
          <tbody>
            <tr>
              <td>PO Number <span style={{ color: "red", fontWeight: "bold" }}>*</span>
             </td>
              <td colSpan="3">
                <input
                  name="distro_po_number"
                  required
                  value={formData.distro_po_number}
                  onChange={handleChange}
                  className="form-control"
                  
                />
              </td>
            </tr>

            <tr>
              <td>Client <span style={{ color: "red", fontWeight: "bold" }}>*</span></td>
              <td>
                <input
                  name="client_name"
                  required
                  value={formData.client_name}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.client_name && <small className="text-danger">{errors.client_name}</small>}
              </td>
              <td>Contact</td>
              <td>
                <input
                  name="client_contact"
                  value={formData.client_contact}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.client_contact && <small className="text-danger">{errors.client_contact}</small>}
              </td>
            </tr>

            <tr>
              <td>Email</td>
              <td>
                <input
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.client_email && <small className="text-danger">{errors.client_email}</small>}
              </td>
              <td>Location</td>
              <td>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.location_name}</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td>Distro</td>
              <td colSpan="3">
                <select
                  name="distro_id"
                  value={formData.distro_id}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select --</option>
                  {distros.map((d) => (
                    <option key={d.id} value={d.id}>{d.given_name}</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td>Start <span style={{ color: "red", fontWeight: "bold" }}>*</span></td>
              <td>
                <input
                  type="date"
                  name="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.start_date && <small className="text-danger">{errors.start_date}</small>}
              </td>
              <td>End</td>
              <td>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="form-control"
                />
              </td>
            </tr>

            <tr>
              <td colSpan="4" className="text-center">
                <button className="btn btn-primary">Save</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default DistroOrderForm;
