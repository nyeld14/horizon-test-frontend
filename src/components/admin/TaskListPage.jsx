import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  MDBCard,
  MDBCardBody,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn
} from "mdb-react-ui-kit";

const TaskListPage = () => {

  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  /* ===============================
  FETCH TASKS
  =============================== */

  const fetchTasks = async (pageNumber = 1) => {

    try {

      const res = await axiosInstance.get(`/tasklist/tasks/?page=${pageNumber}`);

      const taskData = res.data.results || res.data;

      /* SORT TASKS */
      const sortedTasks = taskData.sort((a, b) => {

        const order = {
          "OPEN": 1,
          "IN PROGRESS": 2,
          "CLOSED": 3
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
    fetchTasks(page);
  }, [page]);

  /* ===============================
  STATUS COLOR
  =============================== */

  const getStatusBadge = (status) => {

    const s = status?.toUpperCase();

    if (s === "OPEN") return "bg-primary";
    if (s === "IN PROGRESS") return "bg-success";
    if (s === "CLOSED") return "bg-danger";

    return "bg-secondary";

  };

  return (

    <MDBCard className="shadow-0">

      {/* Header */}

      <div
        style={{
          backgroundColor: "#fff200",
          padding: "10px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        Task List
      </div>

      <MDBCardBody className="p-0">

        <MDBTable bordered responsive className="mb-0">

          <MDBTableHead style={{ backgroundColor: "#dcdcdc" }}>
            <tr>
              <th>S.No</th>
              <th>Unit No</th>
              <th>Location</th>
              <th>Description Of Work</th>
              <th>Assigned To</th>
              <th>Start Date</th>
              <th>Close Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </MDBTableHead>

          <MDBTableBody>

            {tasks.map((task, index) => {

              const isClosed =
                task.status_name?.toUpperCase() === "CLOSED";

              return (

                <tr
                  key={task.id}
                  className={isClosed ? "table-success fw-bold" : ""}
                >

                  <td>{index + 1}</td>

                  <td>{task.inverter_name}</td>

                  <td>{task.location_name}</td>

                  <td>{task.description}</td>

                  <td>
                    {task.assigned_to_name?.length > 0
                      ? task.assigned_to_name.map((name, i) => (
                          <div key={i}>{name}</div>
                        ))
                      : "-"}
                  </td>

                  <td>
                    {task.created_date
                      ? new Date(task.created_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {task.end_date
                      ? new Date(task.end_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <span className={`badge ${getStatusBadge(task.status_name)}`}>
                      {task.status_name}
                    </span>
                  </td>

                  <td>{task.remarks}</td>

                </tr>

              );

            })}

          </MDBTableBody>

        </MDBTable>

        {/* PAGINATION */}

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

export default TaskListPage;