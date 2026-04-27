import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
} from "mdb-react-ui-kit";

const DistroOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [locations, setLocations] = useState([]);
  const [distros, setDistros] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchDropdowns();
  }, []);

  const token = localStorage.getItem("access_token");

  // --------------------
  // Fetch data
  // --------------------
  const fetchOrders = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/distro/orders/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setOrders(res.data.results || res.data);
  };

  const fetchDropdowns = async () => {
    const [locRes, distroRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_BASE_URL}/api/distro/locations/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${import.meta.env.VITE_BASE_URL}/api/distro/distros/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setLocations(locRes.data.results || locRes.data);
    setDistros(distroRes.data.results || distroRes.data);
  };

  // --------------------
  // Edit
  // --------------------
  const handleEdit = (order) => {
    setEditingId(order.id);
    setEditData({
      distro_po_number: order.distro_po_number || "",
      client_name: order.client_display || "",
      distro_id: order.distro_id || "",
      location_id: order.location_id || "",
      start_date: order.start_date || "",
      end_date: order.end_date || "",
    });
  };

  const handleChange = (e) =>
    setEditData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    const payload = {
      distro_po_number: editData.distro_po_number,
      client_name: editData.client_name,
      start_date: editData.start_date,
      end_date: editData.end_date || null,
      distro: editData.distro_id,
      location: editData.location_id,
    };

    await axios.patch(
      `${import.meta.env.VITE_BASE_URL}/api/distro/orders/${editingId}/`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Order updated");
    setEditingId(null);
    fetchOrders();
  };

  // --------------------
  // Delete
  // --------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/api/distro/orders/${id}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchOrders();
  };

  const normalize = (v) => (v ? String(v).toLowerCase() : "");

  const filteredOrders = orders.filter((o) =>
    normalize(o.distro_po_number + o.client_display + o.location_name).includes(
      searchQuery.toLowerCase()
    )
  );

  return (
    <div className="max-w-7xl mx-auto mt-5 px-4" style={{ marginTop: "80px" }}>
      <MDBCard>
        <MDBCardBody>
          <MDBCardTitle className="fw-bold text-primary fs-4">
            📦 Distro Orders
          </MDBCardTitle>

          <input
            className="form-control my-3"
            placeholder="Search PO / Client / Location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <MDBTable bordered hover>
            <MDBTableHead>
              <tr>
                <th>PO</th>
                <th>Distro</th>
                <th>Location</th>
                <th>Client</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </MDBTableHead>

            <MDBTableBody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  {editingId === o.id ? (
                    <>
                      <td>
                        <input
                          name="distro_po_number"
                          value={editData.distro_po_number}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </td>

                      <td>
                        <select
                          name="distro_id"
                          value={editData.distro_id}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">-- Select --</option>
                          {distros.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.given_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <select
                          name="location_id"
                          value={editData.location_id}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">-- Select --</option>
                          {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.location_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <input
                          name="client_name"
                          value={editData.client_name}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </td>

                      <td>
                        <input
                          type="date"
                          name="start_date"
                          value={editData.start_date}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </td>

                      <td>
                        <input
                          type="date"
                          name="end_date"
                          value={editData.end_date || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </td>

                      <td className="d-flex gap-2">
                        <MDBBtn size="sm" color="success" onClick={handleSave}>
                          Save
                        </MDBBtn>
                        <MDBBtn
                          size="sm"
                          color="secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </MDBBtn>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{o.distro_po_number}</td>
                      <td>{o.distro_display}</td>
                      <td>{o.location_name}</td>
                      <td>{o.client_display}</td>
                      <td>{o.start_date}</td>
                      <td>{o.end_date || "—"}</td>
                      <td className="d-flex gap-2">
                        <MDBBtn
                          size="sm"
                          color="info"
                          onClick={() => handleEdit(o)}
                        >
                          ✏
                        </MDBBtn>
                        <MDBBtn
                          size="sm"
                          color="danger"
                          onClick={() => handleDelete(o.id)}
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

export default DistroOrderList;
