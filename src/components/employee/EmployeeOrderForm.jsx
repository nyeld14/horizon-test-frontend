import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const EmployeeOrderForm = () => {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    poId: "",
    location_id: "",
    inverter_id: "",
    generator_no: "",
    site_contact_id: "",
    start_date: "",
    end_date: "",
    remarks: "",
    fuel_price: "",
    co2_emission_per_litre: "",
  });

  const [locations, setLocations] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [generators, setGenerators] = useState([]);
  const [siteContacts, setSiteContacts] = useState([]);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchLocations();
    fetchInverters();
    fetchGenerators();
    fetchSiteContacts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("orders/");
      setOrders(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const fetchLocations = async () => {
    const res = await axiosInstance.get("locations/");
    setLocations(res.data.results || res.data);
  };

  const fetchInverters = async () => {
    const res = await axiosInstance.get("inverters/");
    setInverters(res.data.results || res.data);
  };

  const fetchGenerators = async () => {
    const res = await axiosInstance.get("generators/");
    setGenerators(res.data.results || res.data);
  };

  const fetchSiteContacts = async () => {
    const res = await axiosInstance.get("site-contacts/");
    setSiteContacts(res.data.results || res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.poId) return alert("Please select a PO number");

    const payload = {
      ...(formData.location_id && { location_id: formData.location_id }),
      ...(formData.inverter_id && { inverter_id: formData.inverter_id }),
      ...(formData.generator_no && { generator_no: formData.generator_no }),
      ...(formData.site_contact_id && { site_contact_id: formData.site_contact_id }),
      ...(formData.start_date && { start_date: formData.start_date }),
      ...(formData.end_date && { end_date: formData.end_date }),
      ...(formData.remarks && { remarks: formData.remarks }),
      ...(formData.fuel_price && { fuel_price: formData.fuel_price }),
      ...(formData.co2_emission_per_litre && { co2_emission_per_litre: formData.co2_emission_per_litre }),
    };

    try {
      await axiosInstance.patch(`orders/${formData.poId}/`, payload);
      alert("Order updated successfully");
      setRecentlyUpdatedId(formData.poId);
      setFormData({
        poId: "",
        location_id: "",
        inverter_id: "",
        generator_no: "",
        site_contact_id: "",
        start_date: "",
        end_date: "",
        remarks: "",
        fuel_price: "",
        co2_emission_per_litre: "",
      });
      fetchOrders();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.detail || "Error updating order");
    }
  };

  return (
    <div className="container my-5">
      <h2 className="h5 mb-4">📑 Fill Order Details</h2>

      <form onSubmit={handleSubmit} className="table-responsive">
        <table className="table table-bordered table-sm">
          <tbody>
            <tr>
              <td className="bg-light fw-bold">Select PO Number</td>
              <td colSpan="3">
                <select name="poId" value={formData.poId} onChange={handleChange} className="form-select">
                  <option value="">-- Select PO --</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>{order.po_number}</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td className="bg-light fw-bold">Location</td>
              <td>
                <select name="location_id" value={formData.location_id} onChange={handleChange} className="form-select">
                  <option value="">-- Select --</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                  ))}
                </select>
              </td>

              <td className="bg-light fw-bold">Inverter</td>
              <td>
                <select name="inverter_id" value={formData.inverter_id} onChange={handleChange} className="form-select">
                  <option value="">-- Select --</option>
                  {inverters.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.given_name}</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td className="bg-light fw-bold">Generator</td>
              <td>
                <select name="generator_no" value={formData.generator_no} onChange={handleChange} className="form-select">
                  <option value="">-- Select --</option>
                  {generators.map(gen => (
                    <option key={gen.id} value={gen.id}>{gen.generator_no}</option>
                  ))}
                </select>
              </td>

              <td className="bg-light fw-bold">Site Contact</td>
              <td>
                <select name="site_contact_id" value={formData.site_contact_id} onChange={handleChange} className="form-select">
                  <option value="">-- Select --</option>
                  {siteContacts.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.site_contact_name}</option>
                  ))}
                </select>
              </td>
            </tr>
<tr>
  <td className="bg-light fw-bold">Start Date</td>
  <td>
    <div className="position-relative">
      <input
        type="datetime-local"
        name="start_date"
        id="startDateInput"
        value={formData.start_date}
        onChange={(e) => {
          handleChange(e);
          e.target.blur();
        }}
        className="form-control pe-5"
        style={{ cursor: 'pointer' }}
      />
      <span
        onClick={() => document.getElementById('startDateInput')?.showPicker?.()}
        className="position-absolute top-50 end-0 translate-middle-y me-3"
        style={{ cursor: 'pointer', color: '#999' }}
      >
        📅
      </span>
    </div>
  </td>

  <td className="bg-light fw-bold">End Date</td>
  <td>
    <div className="position-relative">
      <input
        type="datetime-local"
        name="end_date"
        id="endDateInput"
        value={formData.end_date}
        onChange={(e) => {
          handleChange(e);
          e.target.blur();
        }}
        className="form-control pe-5"
        style={{ cursor: 'pointer' }}
      />
      <span
        onClick={() => document.getElementById('endDateInput')?.showPicker?.()}
        className="position-absolute top-50 end-0 translate-middle-y me-3"
        style={{ cursor: 'pointer', color: '#999' }}
      >
        📅
      </span>
    </div>
  </td>
</tr>



            <tr>
              <td className="bg-light fw-bold">Remarks</td>
              <td colSpan="3">
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="form-control" placeholder="Remarks" />
              </td>
            </tr>

            <tr>
              <td className="bg-light fw-bold">Fuel Price</td>
              <td>
                <input type="number" step="0.01" name="fuel_price" value={formData.fuel_price} onChange={handleChange} className="form-control" />
              </td>

              <td className="bg-light fw-bold">CO₂ / Litre</td>
              <td>
                <input type="number" step="0.01" name="co2_emission_per_litre" value={formData.co2_emission_per_litre} onChange={handleChange} className="form-control" />
              </td>
            </tr>

            <tr>
              <td colSpan="4" className="text-center">
                <button type="submit" className="btn btn-primary">Submit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <h4 className="mt-5 mb-3">📋 Orders Filled by Employee</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center table-sm">
          <thead className="table-light">
            <tr>
              <th>PO Number</th>
              <th>Location</th>
              <th>Inverter</th>
              <th>Generator No</th>
              <th>Site Contact</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Remarks</th>
              <th>Fuel Price</th>
              <th>CO₂ / Litre</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className={order.id === recentlyUpdatedId ? "table-success" : ""}>
                <td>{order.po_number}</td>
                <td>{order.location_name || "-"}</td>
                <td>{order.inverter_name || "-"}</td>
                <td>{order.generator_no || "-"}</td>
                <td>{order.site_contact_name || "-"}</td>
                <td>{order.start_date ? new Date(order.start_date).toLocaleDateString() : "-"}</td>
                <td>{order.end_date ? new Date(order.end_date).toLocaleDateString() : "-"}</td>
                <td>{order.remarks || "-"}</td>
                <td>{order.fuel_price || "-"}</td>
                <td>{order.co2_emission_per_litre || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeOrderForm;
