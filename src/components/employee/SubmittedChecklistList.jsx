import React, { useEffect, useState } from "react";
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

const SubmittedChecklistList = () => {
  const [checklists, setChecklists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const pageSize = 20;

  const fetchChecklists = async (page = 1) => {
    try {
      const res = await axiosInstance.get(`/checklists/?page=${page}`);
      setChecklists(res.data.results || []);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
      setCurrentPage(Number(page));
      setCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching checklists:", error.response?.data || error.message);
    }
  };

 
  const fetchChecklistDetails = async (id) => {
    try {
      const res = await axiosInstance.get(`/checklists/${id}/`);
      setSelectedChecklist(res.data); 
    } catch (error) {
      console.error("Error fetching checklist details:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const goToNextPage = () => {
    if (nextPage) {
      const nextPageNum =
        parseInt(new URL(nextPage).searchParams.get("page")) || currentPage + 1;
      fetchChecklists(nextPageNum);
    }
  };

  const goToPrevPage = () => {
    if (prevPage) {
      const prevPageNum =
        parseInt(new URL(prevPage).searchParams.get("page")) || 1;
      fetchChecklists(prevPageNum);
    }
  };

  const filteredChecklists = checklists.filter((chk) => {
    const query = searchQuery.toLowerCase();
    return (
      chk?.tested_by?.toLowerCase().includes(query) ||
      chk?.unit_status?.toLowerCase().includes(query) ||
      chk?.unit_no?.toString().toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <MDBCard className="shadow-sm mb-4">
        <MDBCardBody>
          <MDBCardTitle className="text-primary fw-bold fs-4 mb-3"
           style={{ marginTop: '40px' }}
          >
            📋 Submitted Checklists
          </MDBCardTitle>

          <input
            type="text"
            placeholder="Search by Tested By, Status or Inverter"
            className="form-control mb-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {filteredChecklists.length === 0 ? (
            <p className="text-muted text-center">No checklists found.</p>
          ) : (
            <div className="table-responsive">
              <MDBTable hover bordered align="middle">
                <MDBTableHead light>
                  <tr>
                    <th>Si. No</th>
                    <th>Unit No</th>
                    <th>Unit Model</th>
                    <th>Tested By</th>
                    <th>Date</th>
                    <th>Unit Status</th>
                    <th>Test Time</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {filteredChecklists.map((chk, index) => {
                    const serialNumber = (currentPage - 1) * pageSize + index + 1;
                    return (
                      <tr key={chk.id}>
                        <td>{serialNumber}</td>
                        <td
                          className="text-primary cursor-pointer fw-bold"
                          onClick={() => fetchChecklistDetails(chk.id)} 
                        >
                          {chk.unit_no}
                        </td>
                        <td>{chk.inverter_model}</td>
                        <td>{chk.tested_by}</td>
                        <td>{chk.date}</td>
                        <td>{chk.unit_status}</td>
                        <td>
                          {chk.test_time
                            ? (() => {
                                const [h, m] = chk.test_time.split(":").map(Number);
                                return h * 60 + m + " mins";
                              })()
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </MDBTableBody>
              </MDBTable>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>

    
      {selectedChecklist && (
        <MDBCard className="shadow-sm mb-5">
          <MDBCardBody>
            <MDBCardTitle className="fw-bold fs-5 mb-3">
              📌 Checklist Details for Unit {selectedChecklist.unit_no}
            </MDBCardTitle>

          
            <MDBTable bordered small>
              <MDBTableHead light>
                <tr>
                  <th>Section</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {selectedChecklist.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.section}</td>
                    <td>{item.description}</td>
                    <td>{item.status}</td>
                    <td>{item.remarks || "-"}</td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>

           
            <h6 className="mt-4 fw-semibold">🔋 Battery Voltages</h6>
            <MDBTable bordered small>
              <MDBTableHead light>
                <tr>
                  <th>Battery No</th>
                  <th>Voltage</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {selectedChecklist.batteries?.map((bat, idx) => (
                  <tr key={idx}>
                    <td>{bat.battery_number}</td>
                    <td>{bat.voltage}</td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>

            {selectedChecklist.images?.length > 0 && (
              <div className="mt-4">
                <h6 className="fw-semibold">🖼 Uploaded Images</h6>
                <div className="d-flex flex-wrap gap-3">
                  {selectedChecklist.images.map((img, idx) => (
                    <div key={idx} className="border rounded p-2" style={{ width: "180px" }}>
                      <img
                        src={img.image}
                        alt={`Checklist image ${idx + 1}`}
                        className="img-fluid rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3">
              <MDBBtn color="secondary" onClick={() => setSelectedChecklist(null)}>
                Close
              </MDBBtn>
            </div>
          </MDBCardBody>
        </MDBCard>
      )}

     
      <div className="d-flex justify-content-between items-center px-2 mb-5">
        <p className="text-muted">
          Showing {(currentPage - 1) * pageSize + 1} -{" "}
          {Math.min(currentPage * pageSize, count)} of {count}
        </p>
        <div className="d-flex gap-2">
          <MDBBtn size="sm" color="light" disabled={!prevPage} onClick={goToPrevPage}>
            ⬅ Prev
          </MDBBtn>
          <MDBBtn size="sm" color="light" disabled={!nextPage} onClick={goToNextPage}>
            Next ➡
          </MDBBtn>
        </div>
      </div>
    </div>
  );
};

export default SubmittedChecklistList;
