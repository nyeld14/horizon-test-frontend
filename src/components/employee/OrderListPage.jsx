import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
} from 'mdb-react-ui-kit';
import { Pencil } from 'lucide-react';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  const [locations, setLocations] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [generators, setGenerators] = useState([]);
  const [siteContacts, setSiteContacts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); 



  useEffect(() => {
    fetchFilledOrders();
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const [locRes, invRes, genRes, contactRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/locations/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/inverters/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/generators/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/site-contacts/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setLocations(locRes.data.results || locRes.data || []);
      setInverters(invRes.data.results || invRes.data || []);
      setGenerators(genRes.data.results || genRes.data || []);
      setSiteContacts(contactRes.data.results || contactRes.data || []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const fetchFilledOrders = async  (page = 1) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/orders/?page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const filledOrders = res.data.results.filter(
        (order) =>
          order.location_name ||
          order.inverter_name ||
          order.generator_no ||
          order.site_contact_name ||
          order.start_date ||
          order.end_date
      );

      setOrders(filledOrders);
      setTotalPages(Math.ceil(res.data.count / 20)); 
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to fetch employee-filled orders.');
    }
  };

  const handleSort = (field) => {
  if (sortField === field) {
 
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortOrder('asc');
  }
};


const filteredOrders = orders.filter(
  (order) =>
    order.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.contract_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.inverter_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.generator_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.location_name || '').toLowerCase().includes(searchQuery.toLowerCase())
);

const sortedOrders = [...filteredOrders].sort((a, b) => {
  if (!sortField) return 0;

  const aVal = a[sortField] || '';
  const bVal = b[sortField] || '';

  if (sortOrder === 'asc') {
    return aVal.toString().localeCompare(bVal.toString(), undefined, { numeric: true });
  } else {
    return bVal.toString().localeCompare(aVal.toString(), undefined, { numeric: true });
  }
});


  const handleEdit = (order) => {
    setEditingId(order.id);
    setEditData({
      location_id: order.location_id || '',
      // inverter_id: order.inverter_id || '',
      generator_no: order.generator_no || '',
      site_contact_id: order.site_contact_id_id || '',
      start_date: order.start_date?.split('T')[0] || '',
      end_date: order.end_date?.split('T')[0] || '',
      remarks: order.remarks || '',
      fuel_price: order.fuel_price ?? '',   
      co2_emission_per_litre: order.co2_emission_per_litre ?? '',

    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

const handleSave = async () => {
  try {
    const token = localStorage.getItem('access_token');

    const originalOrder = orders.find((order) => order.id === editingId);
    if (!originalOrder) return;

    const allowedFields = [
      'location_id',
      'generator_no',
      'site_contact_id',
      'start_date',
      'end_date',
      'remarks',
      'fuel_price',
      'co2_emission_per_litre',
    ];

    const changes = {};
    allowedFields.forEach((field) => {
      const originalValue = originalOrder[field] ?? "";
      const newValue = editData[field] ?? "";

      if (String(originalValue) !== String(newValue)) {
        changes[field] = newValue === "" ? null : newValue;
      }
    });


    if (Object.keys(changes).length === 0) {
      alert("No changes made.");
      setEditingId(null);
      return;
    }

    await axios.patch(
      `${import.meta.env.VITE_BASE_URL}/api/orders/${editingId}/`,
      changes, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Order updated successfully");
    setEditingId(null);
    fetchFilledOrders();
  } catch (error) {
    console.error("Update failed", error.response?.data || error.message);
    alert("Update failed");
  }
};


  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this order?'
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/orders/${orderId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Order deleted successfully');
      fetchFilledOrders(); 
    } catch (error) {
      console.error('Delete failed', error.response?.data || error.message);
      alert('Delete failed');
    }
  };


 
  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <MDBCard className="shadow-sm mb-4">
        <MDBCardBody>
          <MDBCardTitle className="text-primary fw-bold fs-4 mb-3">
            📄 Orders List
          </MDBCardTitle>

          {errorMsg && (
            <div className="alert alert-danger text-center">{errorMsg}</div>
          )}

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search by PO number, Inverter name , Contract number ,Generator no "
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          {orders.length === 0 ? (
            <p className="text-muted text-center">
              No orders filled by employees.
            </p>
          ) : (
            <div className="table-responsive">
              <MDBTable hover bordered align="middle">
                
       <MDBTableHead light>
                      <tr>
                        <th>Si. No</th>
                        <th onClick={() => handleSort("po_number")} style={{ cursor: "pointer" }}>
                          PO Number {sortField === "po_number" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("contract_no")} style={{ cursor: "pointer" }}>
                          Contract No {sortField === "contract_no" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("location_name")} style={{ cursor: "pointer" }}>
                          Location {sortField === "location_name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("inverter_name")} style={{ cursor: "pointer" }}>
                          Inverter {sortField === "inverter_name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("generator_no")} style={{ cursor: "pointer" }}>
                          Generator No {sortField === "generator_no" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("site_contact_name")} style={{ cursor: "pointer" }}>
                          Site Contact {sortField === "site_contact_name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("start_date")} style={{ cursor: "pointer" }}>
                          Start Date {sortField === "start_date" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("end_date")} style={{ cursor: "pointer" }}>
                          End Date {sortField === "end_date" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th>Remarks</th>
                        <th>Fuel Price</th>
                        <th>CO₂/litre</th>
                        <th>Actions</th>
                      </tr>
             </MDBTableHead>

                <MDBTableBody>
                  {sortedOrders.map((order, index) => (
                    <tr key={order.id}>
                      <td>{(currentPage - 1) * 20 + index + 1}</td>
                      <td>{order.po_number}</td>
                      <td>{order.contract_no}</td>

                      {editingId === order.id ? (
                        <>
                          <td>
                            <select
                              name="location_id"
                              className="form-control"
                              value={editData.location_id}
                              onChange={handleChange}
                            >
                              <option value="">-- Select --</option>
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.location_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{order.inverter_name || '—'}</td>

                          <td>
                            <select
                              name="generator_no"
                              className="form-control"
                              value={editData.generator_no}
                              onChange={handleChange}
                            >
                              <option value="">-- Select --</option>
                              {generators.map((gen) => (
                                <option key={gen.id} value={gen.id}>
                                  {gen.generator_no}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              name="site_contact_id"
                              className="form-control"
                              value={editData.site_contact_id}
                              onChange={handleChange}
                            >
                              <option value="">-- Select --</option>
                              {siteContacts.map((sc) => (
                                <option key={sc.id} value={sc.id}>
                                  {sc.site_contact_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              name="start_date"
                              type="date"
                              value={editData.start_date}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </td>
                          <td>
                            <input
                              name="end_date"
                              type="date"
                              value={editData.end_date}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </td>
                          <td>
                            <input
                              name="remarks"
                              value={editData.remarks}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </td>
                          <td>
                            <input
                              name="fuel_price"
                              type="text"
                              inputMode="decimal" 
                              pattern="[0-9]*" 
                              value={editData.fuel_price}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </td>
                          <td>
                            <input
                              name="co2_emission_per_litre"
                              type="text"
                              inputMode="decimal" 
                              pattern="[0-9]*"  
                              value={editData.co2_emission_per_litre}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </td>
                          <td className="text-center d-flex gap-2">
                              <MDBBtn
                                size="sm"
                                color="success"
                                onClick={handleSave}
                              >
                                Save
                              </MDBBtn>
                              <MDBBtn
                                size="sm"
                                color="secondary"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditData({});
                                }}
                              >
                                Cancel
                              </MDBBtn>
                            </td>

                        </>
                      ) : (
                        <>
                          <td>{order.location_name || '—'}</td>
                          <td>{order.inverter_name || '—'}</td>
                          <td>{order.generator_no || '—'}</td>
                          <td>{order.site_contact_name || '—'}</td>
                          <td>{order.start_date || '—'}</td>
                          <td>{order.end_date || '—'}</td>
                          <td>{order.remarks || '—'}</td>
                          <td>{order.fuel_price || '—'}</td>
                          <td>{order.co2_emission_per_litre || '—'}</td>
                          <td className="text-center d-flex gap-2">
                            <MDBBtn
                              size="sm"
                              color="info"
                              className="text-white"
                              onClick={() => handleEdit(order)}
                            >
                             <i className="fas fa-pen"></i>

                            </MDBBtn>
                            <MDBBtn
                              size="sm"
                              color="danger"
                              onClick={() => handleDelete(order.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </MDBBtn>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>

            
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <div>
                  <MDBBtn
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>  fetchFilledOrders(currentPage - 1)}
                    className="me-2"
                  >
                    Previous
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchFilledOrders(currentPage + 1)}
                  >
                    Next
                  </MDBBtn>
                </div>
              </div>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default OrderListPage;
