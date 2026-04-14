import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBContainer,
  MDBBtn,
} from 'mdb-react-ui-kit';

const AdminDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <div
        className={`bg-primary text-white pt-5 d-flex flex-column ${
          showSidebar ? '' : 'd-none'
        }`}
        style={{
          width: '200px',
          minHeight: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          paddingTop: '70px',
        }}
      >
        <div className="flex-grow-1">
          <ul className="list-unstyled p-3">

            <li className="mb-3">
              <Link to="/admin-dashboard" className="text-white text-decoration-none">
                <MDBIcon icon="chart-pie" className="me-2" /> Dashboard
              </Link>
            </li>

            <li className="mb-3">
              <Link to="view-pos" className="text-white text-decoration-none">
                <MDBIcon icon="file-alt" className="me-2" /> View POs
              </Link>
            </li>

            <li className="mb-3">
              <Link to="attendance" className="text-white text-decoration-none">
                <MDBIcon icon="user-check" className="me-2" /> Attendance
              </Link>
            </li>

            <li className="mb-3">
              <Link to="leave-approval" className="text-white text-decoration-none">
                <MDBIcon icon="calendar-check" className="me-2" /> Leave Approval
              </Link>
            </li>

            <li className="mb-3">
              <Link to="create-task" className="text-white text-decoration-none">
                <MDBIcon icon="tasks" className="me-2" /> Add Task
              </Link>
            </li>
            <li className="mb-3">
              <Link to="task-list" className="text-white text-decoration-none">
                <MDBIcon icon="list" className="me-2" /> Task List
              </Link>
           </li>

          </ul>
        </div>

        <div className="p-3">
          <MDBBtn color="danger" size="sm" onClick={handleLogout} className="w-100">
            Logout
          </MDBBtn>
        </div>
      </div>

      {/* Top Navbar */}
      <MDBNavbar dark bgColor="dark" className="px-3 fixed-top d-flex justify-content-between">
        <MDBContainer fluid className="d-flex justify-content-between align-items-center">

          <div className="d-flex align-items-center">

            <MDBNavbarToggler onClick={() => setShowSidebar(!showSidebar)}>
              <MDBIcon icon="bars" />
            </MDBNavbarToggler>

            {/* FIXED */}
            <MDBNavbarBrand
              className="ms-3"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/admin-dashboard")}
            >
              Horizon Admin Panel
            </MDBNavbarBrand>

          </div>

          <div className="text-white me-3">
            Welcome, <strong>{userName}</strong>!
          </div>

        </MDBContainer>
      </MDBNavbar>

      {/* Main Content */}
      <div
        style={{
          marginLeft: showSidebar ? '200px' : '0',
          paddingTop: '70px',
          paddingBottom: '30px',
          width: '100%',
          backgroundColor: '#f8f9fa',
          overflowY: 'auto',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <div className="container py-4">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;