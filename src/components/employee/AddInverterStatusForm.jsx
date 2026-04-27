import React, { useState } from 'react';
import axiosInstance from "../../api/axiosInstance";

const AddInverterStatusForm = () => {
  const [statusName, setStatusName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post(
        'inverter-statuses/',
        { inverter_status_name: statusName }
      );
      setSuccessMessage('Inverter status added successfully!');
      setErrorMessage('');
      setStatusName('');
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        setErrorMessage(
          error.response.data.inverter_status_name?.[0] || 'Failed to add inverter status.'
        );
      } else {
        setErrorMessage('Failed to add inverter status.');
      }
      setSuccessMessage('');
    }
  };

  return (
    <div className="container my-4">
      <div className="card p-4 shadow-sm">
        <h2 className="h5 mb-3">➕ Add Inverter Status</h2>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Status Name</label>
            <input
              type="text"
              value={statusName}
              onChange={(e) => setStatusName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Status
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInverterStatusForm;
