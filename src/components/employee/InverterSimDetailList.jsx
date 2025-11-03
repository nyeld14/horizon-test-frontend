import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
} from 'mdb-react-ui-kit';

const InverterSimDetailList = () => {
  const [simDetails, setSimDetails] = useState([]);
  const [formData, setFormData] = useState({
    inverter_id: '',
    phone_number: '',
    serial_no: '',
    user_no: '',
    installation_date: '',
    remarks: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [inverters, setInverters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const totalPages = Math.ceil(count / pageSize);

  // Validation rules
  const validationRules = {
    phone_number: {
      regex: /^\d{5,15}$/,
      example: '5–15 digits only',
    },
    serial_no: {
      regex: /^\d+$/,
      example: 'Digits only (e.g., 123456)',
    },
    user_no: {
    regex: /^[A-Za-z0-9-]+$/,  
    example: 'Alphanumeric with hyphen (e.g., User-1)',
  },
    remarks: {
      regex: /^[A-Za-z0-9\s!@#$%^&*(),/.?":{}|<>_-]*$/,
      example: 'Alphanumeric + spaces + special characters',
    },
  };

  const validateField = (name, value) => {
    if (validationRules[name]) {
      const { regex, example } = validationRules[name];
      if (value && !regex.test(value)) {
        return `Example: ${example}`;
      }
    }
    return '';
  };

  

  // Fetch SIM details
  const fetchSimDetails = async (page = 1, search = '') => {
    try {
      let url = `/inverter-sim-details/?page=${page}`;
      if (search) url += `&search=${search}`;
      const response = await axiosInstance.get(url);
      setSimDetails(response.data.results || []);
      setCount(response.data.count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching SIM details:', error.response?.data || error.message);
    }
  };

  // Fetch inverters for dropdown
  const fetchInverters = async () => {
    try {
      const response = await axiosInstance.get('/inverters/');
      setInverters(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching inverters:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchInverters();
    fetchSimDetails();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSimDetails(1, searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Add form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      await axiosInstance.post('/inverter-sim-details/', formData);
      setFormData({
        inverter_id: '',
        phone_number: '',
        serial_no: '',
        user_no: '',
        installation_date: '',
        remarks: '',
      });
      setFormErrors({});
      fetchSimDetails(currentPage, searchQuery);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  };

  // Edit handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });

    const error = validateField(name, value);
    setEditErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSaveEdit = async () => {
    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, editData[field]);
      if (error) newErrors[field] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    try {
      await axiosInstance.put(`/inverter-sim-details/${editingId}/`, editData);
      setEditingId(null);
      setEditData({});
      setEditErrors({});
      fetchSimDetails(currentPage, searchQuery);
    } catch (error) {
      console.error('Error updating SIM detail:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SIM detail?')) return;
    try {
      await axiosInstance.delete(`/inverter-sim-details/${id}/`);
      fetchSimDetails(currentPage, searchQuery);
    } catch (error) {
      console.error('Error deleting SIM detail:', error.response?.data || error.message);
    }
  };

  // Pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) fetchSimDetails(currentPage + 1, searchQuery);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) fetchSimDetails(currentPage - 1, searchQuery);
  };

  // Sorting
  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sorted = [...simDetails].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
      if (key === 'installation_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setSimDetails(sorted);
    setSortConfig({ key, direction });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Add SIM Form */}
      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <MDBCardTitle className="text-primary fw-bold fs-5 mb-1">
            ➕ Add New Inverter SIM Detail
          </MDBCardTitle>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Select Inverter</label>
              <select
                name="inverter_id"
                value={formData.inverter_id}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">-- Select Inverter --</option>
                {inverters.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.unit_id} 
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={`form-control ${formErrors.phone_number ? 'is-invalid' : ''}`}
                required
              />
              {formErrors.phone_number && (
                <div className="invalid-feedback">{formErrors.phone_number}</div>
              )}
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">SIM Serial No</label>
              <input
                type="text"
                name="serial_no"
                value={formData.serial_no}
                onChange={handleChange}
                className={`form-control ${formErrors.serial_no ? 'is-invalid' : ''}`}
                required
              />
              {formErrors.serial_no && (
                <div className="invalid-feedback">{formErrors.serial_no}</div>
              )}
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">User No</label>
              <input
                type="text"
                name="user_no"
                value={formData.user_no}
                onChange={handleChange}
                className={`form-control ${formErrors.user_no ? 'is-invalid' : ''}`}
                required
              />
              {formErrors.user_no && (
                <div className="invalid-feedback">{formErrors.user_no}</div>
              )}
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Installation Date</label>
              <input
                type="date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Remarks</label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className={`form-control ${formErrors.remarks ? 'is-invalid' : ''}`}
              />
              {formErrors.remarks && (
                <div className="invalid-feedback">{formErrors.remarks}</div>
              )}
            </div>

            <div className="col-md-2 align-self-end">
              <button type="submit" className="btn btn-primary w-100">
                Add
              </button>
            </div>
          </form>
        </MDBCardBody>
      </MDBCard>

      {/* SIM Table */}
    {/* SIM Table */}
<MDBCard>
  <MDBCardBody>
    <MDBCardTitle className="text-secondary fs-5 mb-3">
      📋 SIM Details Listing
    </MDBCardTitle>

    {/* 🔍 Search Bar */}
    <div className="mb-3 d-flex gap-2">
      <input
        type="text"
        placeholder="Search by Inverter, Phone, or SIM Serial"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="form-control"
      />
      {searchQuery && (
        <MDBBtn color="secondary" onClick={() => setSearchQuery('')}>
          Clear
        </MDBBtn>
      )}
    </div>

    <MDBTable hover bordered responsive align="middle">
      <MDBTableHead light>
        <tr>
          <th>SI No</th>
          <th onClick={() => sortData('inverter_id')} style={{ cursor: 'pointer' }}>
            Inverter {sortConfig.key === 'inverter_id' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => sortData('phone_number')} style={{ cursor: 'pointer' }}>
            Phone Number {sortConfig.key === 'phone_number' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => sortData('serial_no')} style={{ cursor: 'pointer' }}>
            SIM Serial No {sortConfig.key === 'serial_no' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => sortData('user_no')} style={{ cursor: 'pointer' }}>
            User No {sortConfig.key === 'user_no' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => sortData('installation_date')} style={{ cursor: 'pointer' }}>
            Installation Date {sortConfig.key === 'installation_date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
          </th>
          <th>Remarks</th>
          <th>Actions</th>
        </tr>
      </MDBTableHead>


            <MDBTableBody>
              {simDetails.length > 0 ? (
                simDetails.map((sim, index) => (
                  <tr key={sim.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>
                      {editingId === sim.id ? (
                        <select
                          name="inverter_id"
                          value={editData.inverter_id}
                          onChange={handleEditChange}
                          className="form-select"
                        >
                          <option value="">-- Select Inverter --</option>
                          {inverters.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.unit_id} ({inv.serial_no})
                            </option>
                          ))}
                        </select>
                      ) : (
                        inverters.find((i) => i.id === sim.inverter_id)?.unit_id || 'N/A'
                      )}
                    </td>

                    <td>
                      {editingId === sim.id ? (
                        <>
                          <input
                            name="phone_number"
                            value={editData.phone_number}
                            onChange={handleEditChange}
                            className={`form-control ${editErrors.phone_number ? 'is-invalid' : ''}`}
                          />
                          {editErrors.phone_number && (
                            <div className="invalid-feedback">{editErrors.phone_number}</div>
                          )}
                        </>
                      ) : (
                        sim.phone_number
                      )}
                    </td>

                    <td>
                      {editingId === sim.id ? (
                        <>
                          <input
                            name="serial_no"
                            value={editData.serial_no}
                            onChange={handleEditChange}
                            className={`form-control ${editErrors.serial_no ? 'is-invalid' : ''}`}
                          />
                          {editErrors.serial_no && (
                            <div className="invalid-feedback">{editErrors.serial_no}</div>
                          )}
                        </>
                      ) : (
                        sim.serial_no
                      )}
                    </td>

                    <td>
                      {editingId === sim.id ? (
                        <>
                          <input
                            name="user_no"
                            value={editData.user_no}
                            onChange={handleEditChange}
                            className={`form-control ${editErrors.user_no ? 'is-invalid' : ''}`}
                          />
                          {editErrors.user_no && (
                            <div className="invalid-feedback">{editErrors.user_no}</div>
                          )}
                        </>
                      ) : (
                        sim.user_no
                      )}
                    </td>

                    <td>
                      {editingId === sim.id ? (
                        <input
                          type="date"
                          name="installation_date"
                          value={editData.installation_date}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      ) : (
                        sim.installation_date.slice(0, 10)
                      )}
                    </td>

                    <td>
                      {editingId === sim.id ? (
                        <>
                          <input
                            name="remarks"
                            value={editData.remarks}
                            onChange={handleEditChange}
                            className={`form-control ${editErrors.remarks ? 'is-invalid' : ''}`}
                          />
                          {editErrors.remarks && (
                            <div className="invalid-feedback">{editErrors.remarks}</div>
                          )}
                        </>
                      ) : (
                        sim.remarks || 'N/A'
                      )}
                    </td>

                    <td className="text-center d-flex gap-2 justify-content-center">
                     {editingId === sim.id ? (
                            <>
                              <MDBBtn size="sm" color="success" onClick={handleSaveEdit}>
                                Save
                              </MDBBtn>
                              <MDBBtn
                                size="sm"
                                color="secondary"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditData({});
                                  setEditErrors({});
                                }}
                              >
                                Cancel
                              </MDBBtn>
                            </>
                          ) : (
                            <>
                              <MDBBtn
                                size="sm"
                                color="info"
                                className="text-white"
                                onClick={() => {
                                  setEditingId(sim.id);
                                  setEditData({
                                    inverter_id: sim.inverter_id,
                                    phone_number: sim.phone_number,
                                    serial_no: sim.serial_no,
                                    user_no: sim.user_no,
                                    installation_date: sim.installation_date.slice(0, 10),
                                    remarks: sim.remarks,
                                  });
                                }}
                              >
                                <i className="fas fa-pen"></i>
                              </MDBBtn>
                              <MDBBtn
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(sim.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </MDBBtn>
                            </>
                          )}

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No SIM details found.
                  </td>
                </tr>
              )}
            </MDBTableBody>
          </MDBTable>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default InverterSimDetailList;
