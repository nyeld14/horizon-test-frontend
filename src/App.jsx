import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginForm from './components/LoginForm';
import RegisterUser from './components/RegisterUser';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

import ProtectedRoute from './components/ProtectedRoute';
import AdminPOForm from './components/AdminPOForm';
import AdminPOList from './components/AdminPOList';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import InverterStatusChart from './components/employee/InverterStatusChart';
import Checklist from './components/employee/ChecklistForm';
import SubmittedChecklistList from './components/employee/SubmittedChecklistList';
import InverterUtilizationChart from './components/employee/InverterTrendChart';
import InverterDetail from './components/employee/InverterDetail';
import UsageReport from './components/employee/UsageReport';

import AdminAttendancePage from './components/AdminAttendancePage';
import AdminLeaveApprovalPage from './components/AdminLeaveApprovalPage';

function App() {
  return (
    <Router>
      <>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route
            path="/reset-password/:uidb64/:token"
            element={<ResetPasswordForm />}
          />

          <Route path="/register/admin" element={<RegisterUser role="admin" />} />
          <Route
            path="/register/employee"
            element={<RegisterUser role="employee" />}
          />
          <Route path="/register/guest" element={<RegisterUser role="guest" />} />

          {/* ADMIN DASHBOARD + nested pages */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            {/* default dashboard content */}
            <Route index element={<InverterStatusChart mode="admin" />} />

            {/* existing admin pages */}
            <Route path="add-po" element={<AdminPOForm />} />
            <Route path="view-pos" element={<AdminPOList />} />
            <Route path="trend-chart" element={<InverterUtilizationChart />} />

            {/* ✅ NEW admin attendance & leave approval pages */}
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="leave-approval" element={<AdminLeaveApprovalPage />} />
          </Route>

          {/* EMPLOYEE DASHBOARD (tabs handled inside EmployeeDashboard) */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Employee unit detail page */}
          <Route
            path="/employee-dashboard/inverters/:id"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <InverterDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;
