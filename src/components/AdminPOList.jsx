import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from 'mdb-react-ui-kit';

const AdminPOList = () => {
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState({}); 
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [count, setCount] = useState(0);
  const pageSize = 20;

  const [locations, setLocations] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [generators, setGenerators] = useState([]);
  const [siteContacts, setSiteContacts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showWithoutEndDate, setShowWithoutEndDate] = useState(true);


  const patterns = {
    po_number: /^[A-Za-z0-9/\- ]+$/,
    contract_no: /^[A-Za-z0-9\-]+$/,
    remarks: /^[A-Za-z0-9\s.,;:!@#&()\-_/]*$/,
  };

  useEffect(() => {
    fetchOrders();
    fetchDropdownData();
  }, []);

  const fetchOrders = async (page = 1) => {
    try {
      const response = await axiosInstance.get(`/orders/?page=${page}`);
      setOrders(response.data.results || []);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
      setCount(response.data.count || 0);
      setCurrentPage(Number(page));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [locRes, invRes, genRes, siteRes] = await Promise.all([
        axiosInstance.get('/locations/'),
        axiosInstance.get('/inverters/'),
        axiosInstance.get('/generators/'),
        axiosInstance.get('/site-contacts/'),
      ]);
      setLocations(locRes.data.results || locRes.data);
      setInverters(invRes.data.results || invRes.data);
      setGenerators(genRes.data.results || genRes.data);
      setSiteContacts(siteRes.data.results || siteRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data', error);
    }
  };

  const handleEdit = (order) => {
    setEditingId(order.id);
    setEditData({
      ...order,
      location: order.location,
      inverter: order.inverter,
      generator: order.generator,
      site_contact: order.site_contact,
      start_date: order.start_date,
      end_date: order.end_date,
    });
    setErrors({});
  };


  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'po_number':
        if (!patterns.po_number.test(value)) {
          error =
            'PO Number can only contain letters, digits, slashes (/), dashes (-), and spaces.';
        }
        break;
      case 'contract_no':
        if (!patterns.contract_no.test(value)) {
          error =
            'Contract Number can only contain letters, digits, and dashes (-).';
        }
        break;
      case 'remarks':
        if (value && !patterns.remarks.test(value)) {
          error =
            'Remarks may only contain letters, numbers, spaces, and basic punctuation.';
        }
        break;
      case 'end_date':
        if (editData.start_date && value && new Date(value) < new Date(editData.start_date)) {
          error = 'End date must be after Start date.';
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSave = async () => {
 
    if (Object.values(errors).some((err) => err)) {
      alert('Please fix validation errors before saving.');
      return;
    }

    try {
      const payload = {
        po_number: editData.po_number,
        contract_no: editData.contract_no,
        remarks: editData.remarks,
        start_date: editData.start_date || null,
        end_date: editData.end_date || null,
        location_id: editData.location,
        inverter: editData.inverter,
        generator_no: editData.generator,
        site_contact_id: editData.site_contact,
      };
      const response = await axiosInstance.patch(`/orders/${editingId}/`, payload);

      setOrders((prev) =>
        prev.map((order) => (order.id === editingId ? response.data : order))
      );

      alert('Order updated successfully');
      setEditingId(null);
      fetchOrders(currentPage);
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save changes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PO?')) return;
    try {
      await axiosInstance.delete(`/orders/${id}/`);
      alert('PO deleted successfully');
      fetchOrders(currentPage);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete PO');
    }
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(count / pageSize);
    if (currentPage < totalPages) {
      fetchOrders(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      fetchOrders(currentPage - 1);
    }
  };

  const filteredOrders = orders.filter((order) => {
  const query = searchQuery.toLowerCase();

  const matchesSearch =
    order.po_number?.toLowerCase().includes(query) ||
    order.contract_no?.toLowerCase().includes(query) ||
    order.remarks?.toLowerCase().includes(query) ||
    (order.inverter_name || '').toLowerCase().includes(query) ||
    (order.generator_no || '').toLowerCase().includes(query) ||
    (order.location_name || '').toLowerCase().includes(query) ||
    (order.client_name || '').toLowerCase().includes(query);

  const matchesNoEndDate = showWithoutEndDate ? !order.end_date : true;

  return matchesSearch && matchesNoEndDate;
});


  const handleOffhire = async (id) => {
    if (!window.confirm('Are you sure you want to offhire this PO?')) return;
    try {
      await axiosInstance.post(`/orders/${id}/offhire/`);
      alert('PO offhired successfully');
      fetchOrders(currentPage);
    } catch (error) {
      console.error('Error offhiring order:', error);
      alert('Failed to offhire PO');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA, valB;

    if (sortConfig.key === 'serial') {
      valA = a.id;
      valB = b.id;
    } else {
      valA = a[sortConfig.key] || '';
      valB = b[sortConfig.key] || '';
    }

    if (sortConfig.key === 'start_date' || sortConfig.key === 'end_date') {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="w-full ml-[100px] flex justify-start" style={{ width: '120%' }}>
      <MDBCard className="card shadow-sm mb-4" style={{ width: '100%' }}>
        <MDBCardBody>
          <MDBCardTitle className="text-primary fw-bold fs-4 mb-3">
            📦 Admin PO List
          </MDBCardTitle>

        
    <div className="d-flex align-items-center mb-3">
  <input
    type="text"
    className="form-control me-3"
    placeholder="🔍 Search by PO Number, Inverter, Contract No, Location, Generator, Client Name"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    style={{ flex: 1 }}
  />

  <MDBBtn
    size="sm"
    color={showWithoutEndDate ? 'primary' : 'secondary'}
    onClick={() => setShowWithoutEndDate((prev) => !prev)}
  >
    {showWithoutEndDate ? 'Showing Without End Date' : 'Showing All POs'}
  </MDBBtn>
</div>



          {sortedOrders.length === 0 ? (
            <p className="text-muted text-center">No POs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <MDBTable
                hover
                bordered
                align="middle"
                style={{ tableLayout: 'fixed', width: '100%', fontSize: '0.85rem' }}
              >
               <MDBTableHead light>
                                <tr>
                                  <th style={{ width: '5%' }}>SI No</th>
                                  <th
                                    style={{ width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('po_number')}
                                  >
                                    PO Number {getSortIcon('po_number')}
                                  </th>
                                  <th
                                    style={{ width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('contract_no')}
                                  >
                                    Contract No {getSortIcon('contract_no')}
                                  </th>
                                  <th
                                    style={{ width: '15%', cursor: 'pointer' }}
                                    onClick={() => handleSort('inverter_name')}
                                  >
                                    Inverter {getSortIcon('inverter_name')}
                                  </th>
                                  <th
                                    style={{ width: '12%', cursor: 'pointer' }}
                                    onClick={() => handleSort('client_name')}
                                  >
                                    Client {getSortIcon('client_name')}
                                  </th>
                                  <th
                                    style={{ width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('location_name')}
                                  >
                                    Location {getSortIcon('location_name')}
                                  </th>
                                  <th
                                    style={{ width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('start_date')}
                                  >
                                    Start Date {getSortIcon('start_date')}
                                  </th>
                                  <th
                                    style={{ width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('end_date')}
                                  >
                                    End Date {getSortIcon('end_date')}
                                  </th>
                                  <th
                                    style={{ width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('generator_no')}
                                  >
                                    Generator {getSortIcon('generator_no')}
                                  </th>
                                  <th
                                    style={{ width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('site_contact_name')}
                                  >
                                    Site Contact {getSortIcon('site_contact_name')}
                                  </th>
                                  <th style={{ width: '10%' }}>Remarks</th>
                                  <th style={{ width: '12%' }}>Created By</th>
                                  <th style={{ width: '7%' }}>Edit</th>
                                  <th style={{ width: '7%' }}>Delete</th>
                                  <th style={{ width: '7%' }}>Offhire</th>
                                </tr>
                              </MDBTableHead>

                <MDBTableBody>
                  {sortedOrders.map((order, index) => {
                    const serial = (currentPage - 1) * pageSize + index + 1;
                    return (
                      <tr key={order.id} style={{ fontSize: '0.85rem' }}>
                        {editingId === order.id ? (
                          <>
                            <td>{serial}</td>
                            <td>
                              <input
                                name="po_number"
                                className={`form-control ${errors.po_number ? 'is-invalid' : ''}`}
                                value={editData.po_number || ''}
                                onChange={handleChange}
                              />
                              {errors.po_number && (
                                <div className="invalid-feedback">{errors.po_number}</div>
                              )}
                            </td>
                            <td>
                              <input
                                name="contract_no"
                                className={`form-control ${errors.contract_no ? 'is-invalid' : ''}`}
                                value={editData.contract_no || ''}
                                onChange={handleChange}
                              />
                              {errors.contract_no && (
                                <div className="invalid-feedback">{errors.contract_no}</div>
                              )}
                            </td>
                            <td>
                              <select
                                name="inverter"
                                className="form-select"
                                value={editData.inverter || ''}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                {inverters.map((inv) => (
                                  <option key={inv.id} value={inv.id}>
                                    {inv.given_name || inv.unit_id}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                name="client_name"
                                className="form-control"
                                value={editData.client_name || ''}
                                disabled
                              />
                            </td>
                            <td>
                              <select
                                name="location"
                                className="form-select"
                                value={editData.location || ''}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                {locations.map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.location_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                name="start_date"
                                type="date"
                                className="form-control"
                                value={editData.start_date || ''}
                                onChange={handleChange}
                              />
                            </td>
                            <td>
                              <input
                                name="end_date"
                                type="date"
                                className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
                                value={editData.end_date || ''}
                                onChange={handleChange}
                              />
                              {errors.end_date && (
                                <div className="invalid-feedback">{errors.end_date}</div>
                              )}
                            </td>
                            <td>
                              <select
                                name="generator"
                                className="form-select"
                                value={editData.generator || ''}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                {generators.map((gen) => (
                                  <option key={gen.id} value={gen.id}>
                                    {gen.generator_no}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                name="site_contact"
                                className="form-select"
                                value={editData.site_contact || ''}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                {siteContacts.map((sc) => (
                                  <option key={sc.id} value={sc.id}>
                                    {sc.site_contact_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                name="remarks"
                                className={`form-control ${errors.remarks ? 'is-invalid' : ''}`}
                                value={editData.remarks || ''}
                                onChange={handleChange}
                              />
                              {errors.remarks && (
                                <div className="invalid-feedback">{errors.remarks}</div>
                              )}
                            </td>
                            <td>
                              <input
                                name="created_by"
                                className="form-control"
                                value={editData.created_by || ''}
                                disabled
                              />
                            </td>
                          <td colSpan={3}>
                                <MDBBtn size="sm" color="success" onClick={handleSave} className="me-2">
                                  Save
                                </MDBBtn>
                                <MDBBtn
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditData({});
                                    setErrors({});
                                  }}
                                >
                                  Cancel
                                </MDBBtn>
                              </td>

                            <td>
                              <MDBBtn
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(order.id)}
                              >
                                Delete
                              </MDBBtn>
                            </td>
                            <td>
                              <MDBBtn
                                className="offhire-btn me-1"
                                size="sm"
                                onClick={() => handleOffhire(order.id)}
                              >
                                <i className="fas fa-power-off"></i>
                              </MDBBtn>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{serial}</td>
                            <td>{order.po_number}</td>
                            <td>{order.contract_no}</td>
                            <td>{order.inverter_name || 'N/A'}</td>
                            <td>{order.client_name || 'N/A'}</td>
                            <td>{order.location_name || 'N/A'}</td>
                            <td>{order.start_date}</td>
                            <td>{order.end_date}</td>
                            <td>{order.generator_no || 'N/A'}</td>
                            <td>{order.site_contact_name || 'N/A'}</td>
                            <td>{order.remarks}</td>
                            <td>{order.created_by || 'N/A'}</td>
                            <td>
                              <MDBBtn
                                size="sm"
                                color="info"
                                className="text-white"
                                onClick={() => handleEdit(order)}
                              >
                                <i className="fas fa-pen"></i>
                              </MDBBtn>
                            </td>
                            <td>
                              <MDBBtn
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(order.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </MDBBtn>
                            </td>
                            <td>
                              <MDBBtn
                                className="offhire-btn me-1"
                                size="sm"
                                onClick={() => handleOffhire(order.id)}
                              >
                                <i className="fas fa-power-off"></i>
                              </MDBBtn>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </MDBTableBody>
              </MDBTable>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <p className="text-muted">
          Showing {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, count)} of {count}
        </p>
        <div className="d-flex gap-2">
          <MDBBtn
            size="sm"
            color="light"
            disabled={!prevPage}
            onClick={goToPrevPage}
          >
            ⬅ Prev
          </MDBBtn>
          <MDBBtn
            size="sm"
            color="light"
            disabled={!nextPage}
            onClick={goToNextPage}
          >
            Next ➡
          </MDBBtn>
        </div>
      </div>
    </div>
  );
};

export default AdminPOList;
