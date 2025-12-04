import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Pencil } from "lucide-react";
import {
  MDBContainer,
  MDBInput,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBCard,
  MDBCardBody,
} from "mdb-react-ui-kit";


const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return "";
  const date = new Date(isoDateString);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const InverterUtilizationList = () => {
  const [utilizations, setUtilizations] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    inverter_id: "",
    model: "",
    status: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUtilizations();
    fetchInverters();
    fetchStatuses();
  }, [currentPage]);

  const fetchUtilizations = async () => {
    const res = await axiosInstance.get(`/inverter-utilizations/?page=${currentPage}`);
    setUtilizations(res.data.results || []);
    setTotalPages(Math.ceil(res.data.count / 10));
  };

  const fetchInverters = async () => {
    const res = await axiosInstance.get("/inverters/");
    setInverters(res.data.results || res.data);
  };

  const fetchStatuses = async () => {
    const res = await axiosInstance.get("/inverter-utilization-statuses/");
    setStatuses(res.data.results || res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      if (editingId) {
        await axiosInstance.put(`/inverter-utilizations/${editingId}/`, formData);
      } else {
        await axiosInstance.post("/inverter-utilizations/", formData);
      }
      setFormData({ date: "", inverter_id: "", model: "", status: "" });
      setEditingId(null);
      fetchUtilizations();
    } catch (err) {
      console.error("Submit Error:", err.response?.data || err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      date: item.date,
      inverter_id: item.inverter_id,
      model: item.model,
      status: item.status,
    });
  };

  return (
    <MDBContainer className="py-4">
      <h2 className="text-center fw-bold mb-4">➕ Add New Inverter Utilization</h2>

      <MDBCard className="mb-4 shadow-sm">
        <MDBCardBody>
          <form onSubmit={handleSubmit} className="row g-3">
  <div className="col-md-3">
    <label htmlFor="date" className="form-label fw-semibold">Date</label>
    <div className="position-relative">
        <input
          type="datetime-local"
          id="date"
          name="date"
          value={formatDateForInput(formData.date)}
          onChange={(e) => {
            handleChange(e);
            e.target.blur(); 
          }}
          required
          className="form-control pe-5"
        />
        <span
          onClick={() => document.getElementById("date")?.showPicker?.()}
          className="position-absolute top-50 end-0 translate-middle-y me-3"
          style={{ cursor: "pointer", color: "#999" }}
        >
          📅
        </span>
      </div>

  </div>

  <div className="col-md-3">
    <label htmlFor="inverter_id" className="form-label fw-semibold">Select Inverter</label>
    <select
      id="inverter_id"
      name="inverter_id"
      value={formData.inverter_id}
      onChange={handleChange}
      required
      className="form-select"
    >
      <option value="">-- Select Inverter --</option>
      {inverters.map((inv) => (
        <option key={inv.id} value={inv.id}>
          {inv.given_name} ({inv.serial_no})
        </option>
      ))}
    </select>
  </div>

  <div className="col-md-3">
    <label htmlFor="model" className="form-label fw-semibold">Model</label>
    <input
      type="text"
      id="model"
      name="model"
      value={formData.model}
      onChange={handleChange}
      required
      className="form-control"
    />
  </div>

  <div className="col-md-3">
    <label htmlFor="status" className="form-label fw-semibold">Status</label>
    <select
      id="status"
      name="status"
      value={formData.status}
      onChange={handleChange}
      required
      className="form-select"
    >
      <option value="">-- Select Status --</option>
      {statuses.map((status) => (
        <option key={status.id} value={status.id}>
          {status.inverter_utilization_status_name}
        </option>
      ))}
    </select>
  </div>

  <div className="col-md-12 text-end">
    <MDBBtn type="submit" color="primary">
      {editingId ? "Update Utilization" : "Add Utilization"}
    </MDBBtn>
  </div>
</form>

        </MDBCardBody>
      </MDBCard>

      <h2 className="text-center fw-bold mb-4">📋 Utilization Records</h2>

      <MDBCard className="shadow-sm">
        <MDBCardBody>
          <MDBTable striped bordered responsive small className="text-center">
            <MDBTableHead>
              <tr>
                <th>Si.No</th>
                <th>Date</th>
                <th>Inverter</th>
                <th>Model</th>
                <th>Status</th>
                <th>Edit</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {utilizations.map((item, index) => {
                const isEditing = editingId === item.id;
                const inverterName =
                  inverters.find((i) => i.id === item.inverter_id)?.given_name || item.inverter_id;
                const statusName =
                  statuses.find((s) => s.id === item.status)?.inverter_utilization_status_name || item.status;

                return (
                  <tr key={item.id}>
                    <td>{index + 1 + (currentPage - 1) * 10}</td>
                    <td>
                      {isEditing ? (
                                            <div className="position-relative">
                          <input
                            type="datetime-local"
                            id={`edit_date_${item.id}`}
                            name="date"
                            value={formatDateForInput(formData.date)}
                            onChange={(e) => {
                              handleChange(e);
                              e.target.blur();
                            }}
                            className="form-control pe-5"
                          />
                          <span
                            onClick={() =>
                              document.getElementById(`edit_date_${item.id}`)?.showPicker?.()
                            }
                            className="position-absolute top-50 end-0 translate-middle-y me-3"
                            style={{ cursor: "pointer", color: "#999" }}
                          >
                            📅
                          </span>
                        </div>

                      ) : (
                        new Date(item.date).toLocaleString()
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          name="inverter_id"
                          value={formData.inverter_id}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">-- Select Inverter --</option>
                          {inverters.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.given_name} ({inv.serial_no})
                            </option>
                          ))}
                        </select>
                      ) : (
                        inverterName
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        item.model
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">-- Select Status --</option>
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.inverter_utilization_status_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        statusName
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <MDBBtn size="sm" color="success" onClick={handleSubmit}>
                          Save
                        </MDBBtn>
                      ) : (
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                          title="Edit"
                        >
                          <Pencil size={18} color="#0d6efd" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </MDBTableBody>
          </MDBTable>
        </MDBCardBody>
      </MDBCard>

      <div className="d-flex justify-content-center gap-2 mt-4">
        {[...Array(totalPages)].map((_, i) => (
          <MDBBtn
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            color={currentPage === i + 1 ? "primary" : "light"}
            size="sm"
          >
            {i + 1}
          </MDBBtn>
        ))}
      </div>
    </MDBContainer>
  );
};

export default InverterUtilizationList;
