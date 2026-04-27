import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBCard,
  MDBCardBody,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBInput
} from "mdb-react-ui-kit";

const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  /* ===============================
  FETCH STATUSES
  =============================== */
  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/tasklist/task-status/");
      setStatuses(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching statuses", error);
    }
  };

  /* ===============================
  FETCH TASKS WITH PAGINATION
  =============================== */
  const fetchTasks = async (pageNumber = 1) => {
    try {
      const res = await axiosInstance.get(`/tasklist/tasks/?page=${pageNumber}`);
      const taskData = res.data.results || res.data;

      const sortedTasks = [...taskData].sort((a, b) => {
        const order = {
          OPEN: 1,
          "IN PROGRESS": 2,
          CLOSED: 3
        };

        const statusA = order[a.status_name?.toUpperCase()] || 4;
        const statusB = order[b.status_name?.toUpperCase()] || 4;

        return statusA - statusB;
      });

      setTasks(sortedTasks);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  useEffect(() => {
    fetchTasks(page);

    const interval = setInterval(() => {
      fetchTasks(page);
    }, 10000);

    return () => clearInterval(interval);
  }, [page]);

  /* ===============================
  UPDATE STATUS
  =============================== */
  const updateStatus = async (task, statusName) => {
    const statusObj = statuses.find(
      (s) => s.status_name.toUpperCase() === statusName
    );

    if (!statusObj) {
      alert(`${statusName} status not found`);
      return;
    }

    try {
      await axiosInstance.patch(`/tasklist/tasks/${task.id}/`, {
        status: statusObj.id,
        remarks: task.remarks || ""
      });

      await fetchTasks(page);

      setSuccessMessage(`Task ${statusName}`);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Update failed", error.response?.data || error);
      alert(error.response?.data?.error || "Update failed");
    }
  };

  /* ===============================
  REMARK CHANGE
  =============================== */
  const handleRemarksChange = (taskId, value) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, remarks: value }
          : task
      )
    );
  };

  return (
    <MDBCard className="shadow-0">
      {successMessage && (
        <div className="alert alert-success m-3">
          {successMessage}
        </div>
      )}

      <div
        style={{
          backgroundColor: "#fff200",
          padding: "10px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        My Tasks
      </div>

      <MDBCardBody className="p-0">
        <MDBTable bordered responsive className="mb-0">
          <MDBTableHead style={{ backgroundColor: "#dcdcdc" }}>
            <tr>
              <th>S.No</th>
              <th>Unit No</th>
              <th>Location</th>
              <th>Description Of Work</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </MDBTableHead>

          <MDBTableBody>
            {tasks.map((task, index) => {
              const status = task.status_name?.toUpperCase();

              const isOpen = status === "OPEN";
              const isProgress = status === "IN PROGRESS";
              const isClosed = status === "CLOSED";

              return (
                <tr key={task.id} className={isClosed ? "table-success fw-bold" : ""}>
                  <td>{index + 1}</td>
                  <td>{task.inverter_name}</td>
                  <td>{task.location_name}</td>
                  <td>{task.description}</td>

                  <td>
                    {task.created_date
                      ? new Date(task.created_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        status === "OPEN"
                          ? "bg-primary"
                          : status === "IN PROGRESS"
                          ? "bg-success"
                          : status === "CLOSED"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {task.status_name}
                    </span>
                  </td>

                  <td style={{ width: "200px" }}>
                    <MDBInput
                      value={task.remarks || ""}
                      disabled={isClosed}
                      onChange={(e) =>
                        handleRemarksChange(task.id, e.target.value)
                      }
                    />
                  </td>

                  <td>
                    {isOpen && (
                      <MDBBtn
                        size="sm"
                        color="warning"
                        onClick={() => updateStatus(task, "IN PROGRESS")}
                      >
                        Start
                      </MDBBtn>
                    )}

                    {isProgress && (
                      <MDBBtn
                        size="sm"
                        color="danger"
                        onClick={() => updateStatus(task, "CLOSED")}
                      >
                        Close
                      </MDBBtn>
                    )}

                    {isClosed && (
                      <span className="text-danger fw-bold">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </MDBTableBody>
        </MDBTable>

        <div className="d-flex justify-content-between p-3">
          <MDBBtn
            disabled={!prevPage}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </MDBBtn>

          <span style={{ fontWeight: "bold", marginTop: "5px" }}>
            Page {page}
          </span>

          <MDBBtn
            disabled={!nextPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </MDBBtn>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
};

export default EmployeeTaskPage;