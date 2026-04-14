import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBTextArea,
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBModalTitle,
} from "mdb-react-ui-kit";

const CreateTaskPage = () => {

  const [formData, setFormData] = useState({
    inverter: "",
    location: "",
    assigned_to: [],
    description: "",
    remarks: "",
  });

  const [inverters, setInverters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState(false);

  // =============================
  // FETCH DATA
  // =============================

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [invRes, locRes, userRes] = await Promise.all([
          axiosInstance.get("/inverters/"),
          axiosInstance.get("/locations/"),
          axiosInstance.get("/../auth/users/"),
        ]);

        setInverters(invRes.data.results || invRes.data);
        setLocations(locRes.data.results || locRes.data);
        setUsers(userRes.data.results || userRes.data);

      } catch (error) {

        console.error("Error loading task form data:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  // =============================
  // HANDLE INPUT
  // =============================

  const handleChange = (e) => {

    const { name, value, options } = e.target;

    if (name === "assigned_to") {

      const selectedUsers = [];

      for (let i = 0; i < options.length; i++) {

        if (options[i].selected) {
          selectedUsers.push(options[i].value);
        }

      }

      setFormData({
        ...formData,
        assigned_to: selectedUsers,
      });

    } else {

      setFormData({
        ...formData,
        [name]: value,
      });

    }

  };

  // =============================
  // CREATE TASK
  // =============================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axiosInstance.post("/tasklist/tasks/", formData);

      setSuccessModal(true);

      setFormData({
        inverter: "",
        location: "",
        assigned_to: [],
        description: "",
        remarks: "",
      });

    } catch (error) {

      console.error("Task creation error:", error.response?.data);

      alert("Error creating task");

    }

  };

  if (loading) {
    return <div className="text-center mt-5">Loading task form...</div>;
  }

  return (
    <>
      <MDBCard className="mt-4">

        {/* UPDATED BOLD HEADING */}
        <MDBCardHeader className="fw-bold fs-4 text-center">
          Create Task
        </MDBCardHeader>

        <MDBCardBody>

          <form onSubmit={handleSubmit}>

            {/* INVERTER */}

            <label>Inverter</label>

            <select
              name="inverter"
              className="form-control mb-3"
              value={formData.inverter}
              onChange={handleChange}
            >

              <option value="">Select Inverter</option>

              {inverters.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.given_start_name}
                </option>
              ))}

            </select>


            {/* LOCATION */}

            <label>Location</label>

            <select
              name="location"
              className="form-control mb-3"
              value={formData.location}
              onChange={handleChange}
            >

              <option value="">Select Location</option>

              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location_name}
                </option>
              ))}

            </select>


            {/* ASSIGN EMPLOYEE */}

            <label>Assign To (Hold CTRL to select multiple)</label>

            <select
              key={formData.assigned_to.join(",")}
              name="assigned_to"
              className="form-control mb-3"
              multiple
              value={formData.assigned_to}
              onChange={handleChange}
            >

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}

            </select>


            {/* DESCRIPTION */}

            <MDBTextArea
              label="Task Description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mb-3"
            />


            {/* REMARKS */}

            <MDBTextArea
              label="Remarks"
              name="remarks"
              rows={3}
              value={formData.remarks}
              onChange={handleChange}
              className="mb-3"
            />


            <MDBBtn type="submit">Create Task</MDBBtn>

          </form>

        </MDBCardBody>

      </MDBCard>


      {/* SUCCESS POPUP */}

      <MDBModal open={successModal} setOpen={setSuccessModal} tabIndex="-1">

        <MDBModalDialog centered>

          <MDBModalContent>

            <MDBModalHeader>
              <MDBModalTitle>Success</MDBModalTitle>
            </MDBModalHeader>

            <MDBModalBody>
              Task created successfully.
            </MDBModalBody>

            <MDBModalFooter>

              <MDBBtn color="success" onClick={() => setSuccessModal(false)}>
                OK
              </MDBBtn>

            </MDBModalFooter>

          </MDBModalContent>

        </MDBModalDialog>

      </MDBModal>

    </>
  );

};

export default CreateTaskPage;