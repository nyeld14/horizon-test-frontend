import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";

const DistroList = () => {
  const [distros, setDistros] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

  useEffect(() => {
    fetchDistros();
    fetchStatuses();
  }, []);

  const fetchDistros = async (page = 1, query = "") => {
    try {
      const res = await axiosInstance.get(
        `/distro/distros/?page=${page}&search=${query}`
      );
      setDistros(res.data.results || []);
      setCount(res.data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch distros", err);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/distro/distro-statuses/");
      setStatuses(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch statuses", err);
    }
  };

  const handleEdit = (distro) => {
    setEditingId(distro.id);
    setEditData({
      ...distro,
      distro_status: distro.distro_status?.id || "",
    });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axiosInstance.patch(`/distro/distros/${editingId}/`, {
        serial_no: editData.serial_no,
        given_name: editData.given_name,
        distro_status_input: editData.distro_status,
        remarks: editData.remarks,
        link_to_installation: editData.link_to_installation,
      });

      alert("Distro updated");
      setEditingId(null);
      fetchDistros(currentPage);
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this distro?")) return;
    try {
      await axiosInstance.delete(`/distro/distros/${id}/`);
      fetchDistros(currentPage);
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <MDBCard className="mt-4">
      <MDBCardBody>
        <MDBCardTitle
          className="text-primary fw-bold fs-4 mb-3"
          style={{ marginTop: "40px" }}
        >
          📦 Distro List
        </MDBCardTitle>

        <input
          className="form-control mb-3"
          placeholder="Search by Serial, Name, Status"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchDistros(1, e.target.value);
          }}
        />

        <MDBTable bordered hover>
          <MDBTableHead>
            <tr>
              <th>#</th>
              <th>Serial No</th>
              <th>Given Name</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </MDBTableHead>

          <MDBTableBody>
            {distros.map((d, index) => (
              <tr key={d.id}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>

                {editingId === d.id ? (
                  <>
                    <td>
                      <input
                        name="serial_no"
                        value={editData.serial_no || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        name="given_name"
                        value={editData.given_name || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <select
                        name="distro_status"
                        value={editData.distro_status}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Select</option>
                        {statuses.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.distro_status_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        name="remarks"
                        value={editData.remarks || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <MDBBtn size="sm" color="success" onClick={handleSave}>
                        Save
                      </MDBBtn>{" "}
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
                    <td>{d.serial_no}</td>

                    {/* ✅ CLICKABLE GIVEN NAME */}
                    <td>
                      <Link
                        to={`/distro/${d.id}`}
                        className="fw-semibold text-primary text-decoration-none"
                      >
                        {d.given_name}
                      </Link>
                    </td>

                    <td>{d.distro_status?.distro_status_name}</td>
                    <td>{d.remarks}</td>
                    <td>
                      <MDBBtn
                        size="sm"
                        color="info"
                        onClick={() => handleEdit(d)}
                      >
                        ✏️
                      </MDBBtn>{" "}
                      <MDBBtn
                        size="sm"
                        color="danger"
                        onClick={() => handleDelete(d.id)}
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
  );
};

export default DistroList;
