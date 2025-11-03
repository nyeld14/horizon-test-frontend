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

// Employee Components
import ViewOrders from '../components/employee/ViewOrders';
import OrderListPage from '../components/employee/OrderListPage';
import AddLocationForm from '../components/employee/AddLocationForm';
import AddInverterStatusForm from '../components/employee/AddInverterStatusForm';
import AddInverterForm from '../components/employee/AddInverterForm';
import InverterList from '../components/employee/InverterList';
import GeneratorForm from '../components/employee/GeneratorForm';
import GeneratorList from '../components/employee/GeneratorList';
import SiteContactList from '../components/employee/SiteContactList';
import InverterSimDetailList from '../components/employee/InverterSimDetailList';
import InverterUtilizationStatusList from '../components/employee/InverterUtilizationStatusList';
import InverterUtilizationList from '../components/employee/InverterUtilizationList';
import ServiceStatusList from '../components/employee/ServiceStatusList';
import ServiceRecordsForm from '../components/employee/ServiceRecordsForm';
import UsageReport from '../components/employee/UsageReport';
import InverterStatusChart from '../components/employee/InverterStatusChart'; 
import ChecklistForm from '../components/employee/ChecklistForm'; 
import SubmittedChecklistList from '../components/employee/SubmittedChecklistList';
import InverterUtilizationChart from '../components/employee/InverterTrendChart'; 



const EmployeeDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('inverter-summary'); // ✅ Default tab set to inverter summary
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const userName = localStorage.getItem('user_name') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <MDBNavbar
        dark
        bgColor="dark"
        className="px-3 fixed-top d-flex justify-content-between"
      >
        <MDBContainer
          fluid
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <MDBNavbarToggler onClick={() => setShowSidebar(!showSidebar)}>
              <MDBIcon icon="bars" />
            </MDBNavbarToggler>
            <MDBNavbarBrand className="ms-3">
              Horizon Employee Panel
            </MDBNavbarBrand>
          </div>
          <div className="text-white me-3">
            Welcome, <strong>{userName}</strong>!
          </div>
        </MDBContainer>
      </MDBNavbar>

      {showSidebar && (
        <div
          className="bg-primary text-white pt-5 d-flex flex-column"
          style={{
            width: '200px',
            minHeight: '100vh',
            paddingTop: '70px',
            position: 'fixed',
            top: 0,
            left: 0,
          }}
        >
          <div className="flex-grow-1">
            <ul className="list-unstyled p-3">
              {/* ✅ NEW TAB */}
              <li
                className={`mb-3 ${
                  activeTab === 'inverter-summary' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('inverter-summary')}
              >
                <MDBIcon icon="chart-pie" className="me-2" /> Battery Summary
              </li>

            <li
                className={`mb-3 ${activeTab === 'trend-chart' ? 'fw-bold' : ''}`}
                onClick={() => setActiveTab('trend-chart')}
              >
                <MDBIcon icon="chart-line" className="me-2" /> Battery Utilisation Chart
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'order-list' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('order-list')}
              >
                <MDBIcon icon="file-alt" className="me-2" /> Order List
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'add-location' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('add-location')}
              >
                <MDBIcon icon="map-marker-alt" className="me-2" /> Add Location
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'add-inverter' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('add-inverter')}
              >
                <MDBIcon icon="plug" className="me-2" /> Add Battery
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'inverter-list' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('inverter-list')}
              >
                <MDBIcon icon="list" className="me-2" /> Battery List
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'add-generator' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('add-generator')}
              >
                <MDBIcon icon="cogs" className="me-2" /> Add Generator
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'generator-list' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('generator-list')}
              >
                <MDBIcon icon="th-list" className="me-2" /> Generator List
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'site-contact-list' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('site-contact-list')}
              >
                <MDBIcon icon="address-book" className="me-2" /> Site Contact
                List
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'inverter-sim-details' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('inverter-sim-details')}
              >
                <MDBIcon icon="sim-card" className="me-2" /> SIM Details
              </li>
              {/* <li
                className={`mb-3 ${
                  activeTab === 'inverter-utilization-status' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('inverter-utilization-status')}
              >
                <MDBIcon icon="chart-bar" className="me-2" /> Utilization Status
              </li> */}
              {/* <li
                className={`mb-3 ${
                  activeTab === 'inverter-utilization' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('inverter-utilization')}
              >
                <MDBIcon icon="battery-three-quarters" className="me-2" />{' '}
                Inverter Utilization
              </li> */}
              {/* <li
                className={`mb-3 ${
                  activeTab === 'service-status' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('service-status')}
              >
                <MDBIcon icon="wrench" className="me-2" /> Service Status
              </li> */}
              <li
                className={`mb-3 ${
                  activeTab === 'add-service-record' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('add-service-record')}
              >
                <MDBIcon icon="tools" className="me-2" /> Add Service Record
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'upload-usage' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('upload-usage')}
              >
                <MDBIcon icon="upload" className="me-2" /> Usage
              </li>
              <li
                className={`mb-3 ${
                  activeTab === 'check-list' ? 'fw-bold' : ''
                }`}
                onClick={() => setActiveTab('check-list')}
              >
                <MDBIcon icon="search" className="me-2" /> Pre Hire Checklist
              </li>
              <li
                className={`mb-3 ${activeTab === 'submitted-checklists' ? 'fw-bold' : ''}`}
                onClick={() => setActiveTab('submitted-checklists')}
              >
                <MDBIcon icon="clipboard-check" className="me-2" /> Submitted Checklists
              </li>

            </ul>
          </div>
          <div className="p-3">
            <MDBBtn
              color="danger"
              size="sm"
              onClick={handleLogout}
              className="w-100"
            >
              Logout
            </MDBBtn>
          </div>
        </div>
      )}

      <div
        style={{
          marginLeft: showSidebar ? '200px' : '0',
          paddingTop: '140px',
          minHeight: '100vh',
          position: 'relative', // ✅ Ensure z-index works
          zIndex: 1, // ✅ Bring this above chart
          backgroundColor: '#fff',
        }}
        className="p-4"
      >
        <h2 className="fw-bold text-dark mt-5">
          {
            {
              'inverter-summary': 'Battery Summary', 
              'trend-chart': 'Battery Utilisation Chart', 
              'view-orders': 'View Orders',
              'order-list': 'All Order Listings',
              'add-location': 'Add New Location',
              'add-inverter-status': 'Add Inverter Status',
              'add-inverter': 'Add Battery',
              'inverter-list': 'Battery List',
              'add-generator': 'Add Generator',
              'generator-list': 'Generator List',
              'site-contact-list': 'Site Contact List',
              'inverter-sim-details': 'Inverter SIM Details',
              'inverter-utilization-status': 'Inverter Utilization Status',
              'inverter-utilization': 'Inverter Utilization',
              'service-status': 'Service Status',
              'add-service-record': 'Add Service Record',
              'upload-usage': 'Usage  Report',
              'check-list': ' ',
              'submitted-checklists': '',
            }[activeTab]
          }
        </h2>
        {activeTab === 'inverter-summary' && <InverterStatusChart />}{' '}
        {activeTab === 'trend-chart' && <InverterUtilizationChart />} 
        {activeTab === 'view-orders' && <ViewOrders />}
        {activeTab === 'order-list' && <OrderListPage />}
        {activeTab === 'add-location' && <AddLocationForm token={token} />}
        {activeTab === 'add-inverter-status' && (
          <AddInverterStatusForm token={token} />
        )}
        {activeTab === 'add-inverter' && <AddInverterForm token={token} />}
        {activeTab === 'inverter-list' && <InverterList token={token} />}
        {activeTab === 'add-generator' && <GeneratorForm token={token} />}
        {activeTab === 'generator-list' && <GeneratorList token={token} />}
        {activeTab === 'site-contact-list' && <SiteContactList token={token} />}
        {activeTab === 'inverter-sim-details' && (
          <InverterSimDetailList token={token} />
        )}
        {activeTab === 'inverter-utilization-status' && (
          <InverterUtilizationStatusList token={token} />
        )}
        {activeTab === 'inverter-utilization' && (
          <InverterUtilizationList token={token} />
        )}
        {activeTab === 'service-status' && <ServiceStatusList token={token} />}
        {activeTab === 'add-service-record' && (
          <ServiceRecordsForm token={token} />
        )}
        {activeTab === 'upload-usage' && <UsageReport token={token} />}
        {activeTab === 'check-list' && <ChecklistForm token={token} />}
        {activeTab === 'submitted-checklists' && <SubmittedChecklistList />}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
