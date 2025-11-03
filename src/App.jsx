import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginForm from './components/LoginForm';
import RegisterUser from './components/RegisterUser';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import GuestDashboard from './pages/GuestDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPOForm from './components/AdminPOForm';
import AdminPOList from './components/AdminPOList';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import InverterStatusChart from './components/employee/InverterStatusChart';
import Checklist from './components/employee/ChecklistForm';
import SubmittedChecklistList from './components/employee/SubmittedChecklistList';
import InverterUtilizationChart from './components/employee/InverterTrendChart';

function App() {
  return (
    <Router>
      <>
        {/* ✅ Toast container for global popup messages */}
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

        {/* ✅ Application routes */}
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route
            path="/reset-password/:uidb64/:token"
            element={<ResetPasswordForm />}
          />

          {/* Registration */}
          <Route path="/register/admin" element={<RegisterUser role="admin" />} />
          <Route
            path="/register/employee"
            element={<RegisterUser role="employee" />}
          />
          <Route path="/register/guest" element={<RegisterUser role="guest" />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<InverterStatusChart mode="admin" />} />
            <Route path="add-po" element={<AdminPOForm />} />
            <Route path="view-pos" element={<AdminPOList />} />
            <Route path="trend-chart" element={<InverterUtilizationChart />} />
          </Route>

          {/* Employee Dashboard */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="checklist" element={<Checklist />} />
            <Route path="submitted-checklists" element={<SubmittedChecklistList />} />
            <Route path="trend-chart" element={<InverterUtilizationChart />} />
          </Route>

          {/* Guest Dashboard */}
          <Route
            path="/guest-dashboard"
            element={
              <ProtectedRoute allowedRoles={['guest']}>
                <GuestDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;
