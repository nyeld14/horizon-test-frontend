import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MDBContainer, MDBRow, MDBCol, MDBInput } from 'mdb-react-ui-kit';

import logo from '../assets/images/logo.avif';
import CustomButton from '../components/CustomButton';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const validators = {
    email: (value) => {
      if (!value.trim()) return 'Email is required';
      const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(value)) return 'Invalid email format';
      return '';
    },
    password: (value) => {
      if (!value.trim()) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    },
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));


    setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
  };


  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});


    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const errorMsg = validators[field](formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/login/`,
        formData
      );
      const { access, refresh, role, name } = res.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', name);

      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'employee') navigate('/employee-dashboard');
      else navigate('/guest-dashboard');
    } catch (err) {
      const errorData = err.response?.data || {};
      const fieldErrors = {};

      if (errorData.email) fieldErrors.email = errorData.email[0];
      if (errorData.password) fieldErrors.password = errorData.password[0];
      if (!Object.keys(fieldErrors).length) {
        fieldErrors.general =
          errorData.detail || 'Invalid credentials. Please try again.';
      }

      setErrors(fieldErrors);
    }
  };

  return (
    <MDBContainer className="vh-100 d-flex justify-content-center align-items-center gradient-form">
      <div className="login-box">
        <MDBRow>
          <MDBCol col="12" className="mb-5">
            <div className="d-flex flex-column ms-md-5 ms-2 me-2">
              <div className="text-center">
                <img
                  src={logo}
                  alt="logo"
                  style={{
                    width: '185px',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="mt-1 mb-5 pb-1">Welcome to VRM</h4>
              </div>

              <p>Please login to your account</p>

              <form onSubmit={handleSubmit}>
                <MDBInput
                  wrapperClass="mb-1"
                  label="Email address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.email && (
                  <p className="text-danger small">{errors.email}</p>
                )}

                <div className="position-relative mb-1">
                  <MDBInput
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="position-absolute end-0 top-50 translate-middle-y me-3"
                    style={{ cursor: 'pointer', color: '#6c757d' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </div>
                {errors.password && (
                  <p className="text-danger small">{errors.password}</p>
                )}

                {errors.general && (
                  <div className="alert alert-danger">{errors.general}</div>
                )}

                <div className="text-center pt-1 mb-5 pb-1">
                  <CustomButton
                    type="submit"
                    label="Login"
                    className="mb-4 w-100 gradient-custom-2"
                  />
                  <Link className="text-muted" to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>
              </form>

              <div className="text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link
                    to="/register/employee"
                    className="text-primary fw-bold"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </div>
    </MDBContainer>
  );
};

export default LoginForm;
