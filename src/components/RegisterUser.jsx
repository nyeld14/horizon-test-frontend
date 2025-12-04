import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
} from 'mdb-react-ui-kit';

import logo from '../assets/images/logo.avif';

const RegisterUser = ({ userLabel = 'User' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'guest',
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Name is required';
      if (value.length < 3) return 'Name must be at least 3 characters';
      if (!/^[A-Za-z\s]+$/.test(value)) return 'Name must only contain letters and spaces';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Email is required';
      if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/.test(value))
        return 'Invalid email format';
      return '';
    },
    password: (value) => {
      if (!value.trim()) return 'Password is required';
      const strongPasswordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!strongPasswordRegex.test(value)) {
        return 'Password must be at least 8 chars, include uppercase, number & special character';
      }
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
    setSuccessMsg('');

   
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const errorMsg = validators[field](formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/register/`, formData);
      setSuccessMsg('Registration successful! Awaiting admin approval.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorData = err.response?.data || {};
      const backendErrors = {};

      if (errorData.email) backendErrors.email = errorData.email[0];
      if (errorData.password) backendErrors.password = errorData.password[0];
      if (errorData.name) backendErrors.name = errorData.name[0];
      if (!Object.keys(backendErrors).length) backendErrors.general = 'Registration failed.';

      setErrors(backendErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MDBContainer className="my-5 gradient-form">
      <MDBRow>
        <MDBCol col="6" className="mb-5">
          <div className="d-flex flex-column ms-5">
            <div className="text-center">
              <img
                src={logo}
                alt="logo"
                style={{
                  width: '185px',
                  height: 'auto',
                  objectFit: 'contain',
                  imageRendering: 'auto',
                }}
              />
              <h4 className="mt-1 mb-5 pb-1">Create Your VRM Account</h4>
            </div>

            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <form onSubmit={handleSubmit}>
              <MDBInput
                wrapperClass="mb-1"
                label="Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {errors.name && <p className="text-danger small">{errors.name}</p>}

              <MDBInput
                wrapperClass="mb-1"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {errors.email && <p className="text-danger small">{errors.email}</p>}

              <div className="position-relative mb-1">
                <MDBInput
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
              {errors.password && <p className="text-danger small">{errors.password}</p>}

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn
                  className="mb-4 w-100 gradient-custom-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </MDBBtn>
              </div>
            </form>

            <div className="text-center">
              <p className="text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </MDBCol>

        <MDBCol col="6" className="mb-5">
          <div className="d-flex flex-column justify-content-center gradient-custom-2 h-100 mb-4 text-white p-5">
            <h4 className="mb-4">Join us and manage your power intelligently</h4>
            <p className="small mb-0">
              Get instant access to VRM services. Your registration will be
              reviewed by the admin.
            </p>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default RegisterUser;
