import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from 'mdb-react-ui-kit';

import { Link } from 'react-router-dom';


const InverterList = () => {
  const [inverters, setInverters] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const pageSize = 20;

  useEffect(() => {
    fetchInverters();
    fetchStatuses();
  }, []);

  const fetchInverters = async (page = 1, query = '') => {
    try {
      const response = await axiosInstance.get(
        `/inverters/?page=${page}&search=${query}`
      );
      setInverters(response.data.results || []);
      setCount(response.data.count || 0);
      setCurrentPage(Number(page));
    } catch (error) {
      console.error('Failed to fetch inverters:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get('/inverter-statuses/');
      setStatuses(res.data.results || res.data);
    } catch (error) {
      console.error('Failed to fetch statuses', error);
    }
  };

  const validationRules = {
    unit_id: {
      regex: /^HZE\s*-\s*\d{2,5}\/\d{2,5}(?:-\d{2,5})?$/,
      example: 'HZE - 176/300-079, HZE-10/46, or HZE-10/46-061',
    },

    model: {
      regex: /^\d{2,5}\/\d{2,5}$/,
      example: '176/300 or 10/46',
    },
    given_name: {
      regex: /^[A-Za-z0-9\s/-]+$/,
      example: 'H79 176/300ALLYE UNIT or H61 JCB 10/46 2422058',
    },
    serial_no: {
      regex: /^[A-Za-z0-9]+$/,
      example: 'SN12345 or AB9876',
    },

    remarks: {
      regex: /^[A-Za-z0-9\s/-]*$/,
      example: 'Alphanumeric with spaces, / or -',
    },
  };


const normalizeText = (val) => {
  if (!val) return '';
  return val
    .replace(/–|—/g, '-') 
    .replace(/\u00A0/g, ' ') 
    .replace(/\s+/g, ' ') 
    .trim();
};


  const validateField = (name, value) => {
    if (validationRules[name]) {
      const { regex, example } = validationRules[name];
      if (!regex.test(value)) {
        return `Example: ${example}`;
      }
    }
    return '';
  };

  const sortedInverters = [...inverters].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA, valB;

    if (sortConfig.key === 'status') {
      valA = a.inverter_status?.inverter_status_name || '';
      valB = b.inverter_status?.inverter_status_name || '';
    } else {
      valA = a[sortConfig.key] || '';
      valB = b[sortConfig.key] || '';
    }

    if (!isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleEdit = (inverter) => {
    setEditingId(inverter.id);
    setEditData({
      ...inverter,
      inverter_status: inverter.inverter_status?.id || '',
    });
    setEditErrors({});
  };

 const handleChange = (e) => {
  const { name, value } = e.target;

  // DO NOT normalize while typing
  setEditData((prev) => ({ ...prev, [name]: value }));

  // Validate raw value
  const error = validateField(name, value);
  setEditErrors((prev) => ({ ...prev, [name]: error }));
};
  const handleSave = async () => {
  const newErrors = {};
  Object.keys(validationRules).forEach((field) => {
    const error = validateField(field, editData[field] || '');
    if (error) newErrors[field] = error;
  });

  if (Object.keys(newErrors).length > 0) {
    setEditErrors(newErrors);
    return;
  }

  try {
    const payload = {
      unit_id: normalizeText(editData.unit_id),
      model: normalizeText(editData.model),
      given_name: normalizeText(editData.given_name), // normalized only here
      serial_no: normalizeText(editData.serial_no),
      inverter_status_input: editData.inverter_status || null,
      remarks: normalizeText(editData.remarks),
    };

    await axiosInstance.patch(`/inverters/${editingId}/`, payload);
    alert('Inverter updated successfully');
    setEditingId(null);
    fetchInverters(currentPage);
  } catch (error) {
    console.error('Update failed', error.response?.data || error);
    alert(JSON.stringify(error.response?.data));
      let msg = 'Update failed. Please check your inputs.';
      if (error.response?.status === 400) {
        if (error.response?.data?.serial_no) {
          msg = "Serial number must be numeric (or 'NIL').";
        } else if (error.response?.data?.inverter_status_input) {
          msg = 'Invalid inverter status selected.';
        }
      }
      alert(msg);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setEditErrors({});
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this inverter?'
    );
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/inverters/${id}/`);
      alert('Inverter deleted successfully');
      fetchInverters(currentPage);
    } catch (error) {
      console.error('Delete failed', error.response?.data || error);
      alert(`Delete failed: ${JSON.stringify(error.response?.data)}`);
    }
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(count / pageSize);
    if (currentPage < totalPages) fetchInverters(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) fetchInverters(currentPage - 1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8">
      <MDBCard className="shadow-sm mb-4">
        <MDBCardBody>
          <MDBCardTitle className="text-primary fw-bold fs-4 mb-3"
           style={{ marginTop: '40px' }}
          >
            🛠️ Inverter List
          </MDBCardTitle>

          <input
            type="text"
            placeholder="Search by Unit ID, Model, Given Name, Serial No or Status"
            className="form-control mb-3"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchInverters(1, e.target.value);
            }}
          />

          {inverters.length === 0 ? (
            <p className="text-muted text-center">No inverters found.</p>
          ) : (
            <div className="table-responsive">
              <MDBTable hover bordered align="middle">
                <MDBTableHead light>
                  <tr>
                    <th>Si. No</th>
                    <th
                      onClick={() => handleSort('unit_id')}
                      style={{ cursor: 'pointer' }}
                    >
                      Unit ID{' '}
                      {sortConfig.key === 'unit_id'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th>
                    <th
                      onClick={() => handleSort('model')}
                      style={{ cursor: 'pointer' }}
                    >
                      Model{' '}
                      {sortConfig.key === 'model'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th>
                    <th
                      onClick={() => handleSort('given_name')}
                      style={{ cursor: 'pointer' }}
                    >
                      Given Name{' '}
                      {sortConfig.key === 'given_name'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th>
                    {/* ADD THIS MISSING COLUMN
                    <th
                      onClick={() => handleSort('given_start_name')}
                      style={{ cursor: 'pointer' }}
                    >
                      Given Start Name{' '}
                      {sortConfig.key === 'given_start_name'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th> */}
                    <th
                      onClick={() => handleSort('serial_no')}
                      style={{ cursor: 'pointer' }}
                    >
                      Serial No{' '}
                      {sortConfig.key === 'serial_no'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      style={{ cursor: 'pointer' }}
                    >
                      Status{' '}
                      {sortConfig.key === 'status'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </MDBTableHead>

                <MDBTableBody>
                  {sortedInverters.map((inv, index) => {
                    const serialNumber =
                      (currentPage - 1) * pageSize + index + 1;
                    return (
                      <tr key={inv.id}>
                        {editingId === inv.id ? (
                          <>
                            <td>{serialNumber}</td>
                            <td>
                              <input
                                name="unit_id"
                                value={editData.unit_id}
                                onChange={handleChange}
                                className={`form-control ${
                                  editErrors.unit_id ? 'is-invalid' : ''
                                }`}
                              />
                              {editErrors.unit_id && (
                                <div className="invalid-feedback">
                                  {editErrors.unit_id}
                                </div>
                              )}
                            </td>
                            <td>
                              <input
                                name="model"
                                value={editData.model}
                                onChange={handleChange}
                                className={`form-control ${
                                  editErrors.model ? 'is-invalid' : ''
                                }`}
                              />
                              {editErrors.model && (
                                <div className="invalid-feedback">
                                  {editErrors.model}
                                </div>
                              )}
                            </td>
                            <td>
                              <input
                                name="given_name"
                                value={editData.given_name}
                                onChange={handleChange}
                                className={`form-control ${
                                  editErrors.given_name ? 'is-invalid' : ''
                                }`}
                              />
                              {editErrors.given_name && (
                                <div className="invalid-feedback">
                                  {editErrors.given_name}
                                </div>
                              )}
                            </td>
                            {/* <td>
                              <input
                                name="given_start_name"
                                value={editData.given_start_name}
                                onChange={handleChange}
                                className={`form-control ${
                                  editErrors.given_start_name
                                    ? 'is-invalid'
                                    : ''
                                }`}
                              />
                              {editErrors.given_start_name && (
                                <div className="invalid-feedback">
                                  {editErrors.given_start_name}
                                </div>
                              )}
                            </td> */}
                            <td>
                              <input
                                name="serial_no"
                                value={editData.serial_no}
                                onChange={handleChange}
                                className={`form-control ${
                                  editErrors.serial_no ? 'is-invalid' : ''
                                }`}
                              />
                              {editErrors.serial_no && (
                                <div className="invalid-feedback">
                                  {editErrors.serial_no}
                                </div>
                              )}
                            </td>
                            <td>
                              <select
                                name="inverter_status"
                                value={editData.inverter_status || ''}
                                onChange={handleChange}
                                className="form-select"
                              >
                                <option value="">Select Status</option>
                                {statuses.map((status) => (
                                  <option key={status.id} value={status.id}>
                                    {status.inverter_status_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                name="remarks"
                                value={editData.remarks}
                                onChange={handleChange}
                                className={`form-control ${
                                  editErrors.remarks ? 'is-invalid' : ''
                                }`}
                              />
                              {editErrors.remarks && (
                                <div className="invalid-feedback">
                                  {editErrors.remarks}
                                </div>
                              )}
                            </td>
                            <td className="text-center d-flex gap-2 justify-content-center">
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
                                onClick={handleCancel}
                              >
                                Cancel
                              </MDBBtn>
                            </td>
                          </>
                        ) : (
                         
                          <>
                            <td>{serialNumber}</td>
                            <td>
                              <Link  to={`/employee-dashboard/inverters/${inv.id}`} className="text-decoration-underline">
                                {inv.unit_id}
                              </Link>
                            </td>

                            <td>{inv.model}</td>
                            <td>{inv.given_name}</td>
                            {/*<td>{inv.given_start_name}</td>*/}
                            <td>{inv.serial_no}</td>
                            <td>{inv.inverter_status?.inverter_status_name}</td>
                            <td>{inv.remarks}</td>
                            <td className="text-center d-flex gap-2 justify-content-center">
                              <MDBBtn
                                size="sm"
                                color="info"
                                className="text-white"
                                onClick={() => handleEdit(inv)}
                              >
                                <i className="fas fa-pen"></i>
                              </MDBBtn>
                              <MDBBtn
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(inv.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </MDBBtn>

                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </MDBTableBody>
              </MDBTable>

             
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, count)} of {count}
                </span>
                <div>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    disabled={currentPage === 1}
                    onClick={goToPrevPage}
                  >
                    ⬅ Prev
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={currentPage === Math.ceil(count / pageSize)}
                    onClick={goToNextPage}
                  >
                    Next ➡
                  </button>
                </div>
              </div>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default InverterList;
