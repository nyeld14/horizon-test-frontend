import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBContainer,
  MDBBtn,
} from "mdb-react-ui-kit";

/* ===== BATTERY ===== */
import OrderListPage from "../components/employee/OrderListPage";
import AddLocationForm from "../components/employee/AddLocationForm";
import AddInverterForm from "../components/employee/AddInverterForm";
import InverterList from "../components/employee/InverterList";
import GeneratorForm from "../components/employee/GeneratorForm";
import GeneratorList from "../components/employee/GeneratorList";
import SiteContactList from "../components/employee/SiteContactList";
import InverterSimDetailList from "../components/employee/InverterSimDetailList";
import ServiceRecordsForm from "../components/employee/ServiceRecordsForm";
import UsageReport from "../components/employee/UsageReport";
import InverterStatusChart from "../components/employee/InverterStatusChart";
import ChecklistForm from "../components/employee/ChecklistForm";
import SubmittedChecklistList from "../components/employee/SubmittedChecklistList";
import InverterUtilizationChart from "../components/employee/InverterTrendChart";
import AttendancePage from "../components/employee/AttendancePage";
import LeaveApplicationPage from "../components/employee/LeaveApplicationPage";

/* ===== DISTRO ===== */
import AddDistroForm from "../components/distro/AddDistroForm";
import AddDistroLocationForm from "../components/distro/AddDistroLocationForm";
import DistroOrderForm from "../components/distro/DistroOrderForm";
import DistroSimDetailList from "../components/distro/DistroSimDetailList";
import DistroServiceRecordsForm from "../components/distro/DistroServiceRecordsForm";
import DistroStatusChart from "../components/distro/DistroStatusChart";
import DistroTrendLineChart from "../components/distro/DistroTrendLineChart";
import DistroList from "../components/distro/DistroList";
import DistroOrderList from "../components/distro/DistroOrderList";

/* ===== TASK ===== */
import EmployeeTaskPage from "../components/employee/EmployeeTaskPage";

const NAVBAR_HEIGHT = 64;

const EmployeeDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState("attendance");
  const [openMenu, setOpenMenu] = useState("attendance");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  const userName = localStorage.getItem("user_name") || "User";

  const getMenuForTab = (tabKey) => {
    if (["attendance", "leave-application"].includes(tabKey)) {
      return "attendance";
    }
    if (tabKey.startsWith("distro")) {
      return "distro";
    }
    if (tabKey.startsWith("task")) {
      return "tasklist";
    }
    return "battery";
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      setOpenMenu(getMenuForTab(tab));
    }
  }, [searchParams]);

  const changeTab = (tabKey) => {
    setActiveTab(tabKey);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabKey);
    setSearchParams(params);
    setOpenMenu(getMenuForTab(tabKey));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuButtonClass = (menu) =>
    `w-100 text-start fw-bold p-2 rounded mb-1 border-0 ${
      openMenu === menu ? "bg-light text-primary" : "bg-transparent text-white"
    }`;

  const subMenuButtonClass = (key) =>
    `w-100 text-start p-2 rounded mb-1 border-0 ${
      activeTab === key
        ? "bg-light text-primary fw-bold"
        : "bg-transparent text-white"
    }`;

  return (
    <div>
      {/* NAVBAR */}
      <MDBNavbar dark bgColor="dark" className="fixed-top" style={{ height: NAVBAR_HEIGHT }}>
        <MDBContainer fluid className="h-100 d-flex align-items-center">
          <MDBNavbarToggler onClick={() => setShowSidebar(!showSidebar)}>
            <MDBIcon icon="bars" />
          </MDBNavbarToggler>

          <MDBNavbarBrand
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOpenMenu("battery");
              changeTab("inverter-summary");
            }}
          >
            Horizon Employee Panel
          </MDBNavbarBrand>

          <div className="text-white">Welcome, {userName}</div>
        </MDBContainer>
      </MDBNavbar>

      {/* SIDEBAR */}
      {showSidebar && (
        <div
          className="bg-primary text-white position-fixed d-flex flex-column"
          style={{
            width: "230px",
            top: NAVBAR_HEIGHT,
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            overflowY: "auto",
          }}
        >
          <div className="px-3 pt-3">

            {/* ATTENDANCE */}
            <button
              className={menuButtonClass("attendance")}
              onClick={() =>
                openMenu === "attendance"
                  ? setOpenMenu(null)
                  : (setOpenMenu("attendance"), changeTab("attendance"))
              }
            >
              📅 Attendance
            </button>

            {openMenu === "attendance" && (
              <div className="ms-2 mb-3">
                <button
                  className={subMenuButtonClass("attendance")}
                  onClick={() => changeTab("attendance")}
                >
                  Attendance
                </button>
                <button
                  className={subMenuButtonClass("leave-application")}
                  onClick={() => changeTab("leave-application")}
                >
                  Leave Application
                </button>
              </div>
            )}

            {/* BATTERY */}
            <button
              className={menuButtonClass("battery")}
              onClick={() =>
                openMenu === "battery"
                  ? setOpenMenu(null)
                  : (setOpenMenu("battery"), changeTab("inverter-summary"))
              }
            >
              🔋 Battery
            </button>

            {openMenu === "battery" && (
              <div className="ms-2">
                {[
                  ["inverter-summary", "Battery Summary"],
                  ["trend-chart", "Utilisation Chart"],
                  ["order-list", "Order List"],
                  ["add-location", "Add Location"],
                  ["add-inverter", "Add Battery"],
                  ["inverter-list", "Battery List"],
                  ["add-generator", "Add Generator"],
                  ["generator-list", "Generator List"],
                  ["site-contact-list", "Site Contacts"],
                  ["inverter-sim-details", "SIM Details"],
                  ["add-service-record", "Service Record"],
                  ["upload-usage", "Usage"],
                  ["check-list", "Checklist"],
                  ["submitted-checklists", "Submitted Checklists"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={subMenuButtonClass(key)}
                    onClick={() => changeTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* DISTRO */}
            <button
              className={menuButtonClass("distro")}
              onClick={() =>
                openMenu === "distro"
                  ? setOpenMenu(null)
                  : (setOpenMenu("distro"), changeTab("distro-list"))
              }
            >
              📦 Distro
            </button>

            {openMenu === "distro" && (
              <div className="ms-2">
                {[
                  ["distro-add", "➕ Add Distro"],
                  ["distro-location-add", "📍 Add Location"],
                  ["distro-summary", "📊 Distro Summary"],
                  ["distro-trend", "📈 Utilisation Chart"],
                  ["distro-list", "📦 Distro List"],
                  ["distro-orders", "📄 Distro Orders"],
                  ["distro-order-add", "📝 Add Distro Order"],
                  ["distro-sims", "📶 SIM Details"],
                  ["distro-services", "🛠 Service Records"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={subMenuButtonClass(key)}
                    onClick={() => changeTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* TASK LIST */}
            <button
              className={menuButtonClass("tasklist")}
              onClick={() =>
                openMenu === "tasklist"
                  ? setOpenMenu(null)
                  : (setOpenMenu("tasklist"), changeTab("task-view"))
              }
            >
              📋 Task List
            </button>

            {openMenu === "tasklist" && (
              <div className="ms-2">
                <button
                  className={subMenuButtonClass("task-view")}
                  onClick={() => changeTab("task-view")}
                >
                  👁 View Task
                </button>
              </div>
            )}

          </div>

          <div className="p-3 mt-auto">
            <MDBBtn color="danger" size="sm" className="w-100" onClick={handleLogout}>
              Logout
            </MDBBtn>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        style={{ marginLeft: showSidebar ? "230px" : "0", paddingTop: NAVBAR_HEIGHT + 16 }}
        className="p-4"
      >
        {activeTab === "attendance" && <AttendancePage />}
        {activeTab === "leave-application" && <LeaveApplicationPage />}

        {activeTab === "inverter-summary" && <InverterStatusChart />}
        {activeTab === "trend-chart" && <InverterUtilizationChart />}
        {activeTab === "order-list" && <OrderListPage />}
        {activeTab === "add-location" && <AddLocationForm token={token} />}
        {activeTab === "add-inverter" && <AddInverterForm token={token} />}
        {activeTab === "inverter-list" && <InverterList token={token} />}
        {activeTab === "add-generator" && <GeneratorForm token={token} />}
        {activeTab === "generator-list" && <GeneratorList token={token} />}
        {activeTab === "site-contact-list" && <SiteContactList token={token} />}
        {activeTab === "inverter-sim-details" && <InverterSimDetailList token={token} />}
        {activeTab === "add-service-record" && <ServiceRecordsForm token={token} />}
        {activeTab === "upload-usage" && <UsageReport token={token} />}
        {activeTab === "check-list" && <ChecklistForm token={token} />}
        {activeTab === "submitted-checklists" && <SubmittedChecklistList />}

        {activeTab === "distro-add" && <AddDistroForm />}
        {activeTab === "distro-location-add" && <AddDistroLocationForm />}
        {activeTab === "distro-summary" && <DistroStatusChart />}
        {activeTab === "distro-trend" && <DistroTrendLineChart />}
        {activeTab === "distro-list" && <DistroList token={token} />}
        {activeTab === "distro-orders" && <DistroOrderList token={token} />}
        {activeTab === "distro-order-add" && <DistroOrderForm token={token} />}
        {activeTab === "distro-sims" && <DistroSimDetailList token={token} />}
        {activeTab === "distro-services" && <DistroServiceRecordsForm token={token} />}

        {activeTab === "task-view" && <EmployeeTaskPage />}
      </div>
    </div>
  );
};

export default EmployeeDashboard;