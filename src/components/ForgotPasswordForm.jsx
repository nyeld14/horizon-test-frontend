import React, { useState } from 'react';
import { MDBContainer, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import axios from 'axios';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return '';
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setErrors({ email: validateEmail(e.target.value) });
    setMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

 
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/request-reset-password/`,
        { email }
      );
      setMsg('✅ Password reset link sent to your email.');
      setEmail('');


      setTimeout(() => {
        setMsg('');
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      const backendMsg =
        err.response?.data?.error || 'Unable to send reset link. Email may not exist.';
      setMsg(`❌ ${backendMsg}`);
      setTimeout(() => setMsg(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MDBContainer
      className="my-5 p-5 border rounded shadow"
      style={{ maxWidth: '500px' }}
    >
      <h4 className="mb-4 text-center">Forgot Password</h4>

      {msg && (
        <div
          className={`alert ${
            msg.startsWith('✅') ? 'alert-success' : 'alert-danger'
          }`}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <MDBInput
          label="Enter your registered email"
          type="email"
          value={email}
          onChange={handleChange}
          required
          className="mb-2"
        />
        {errors.email && <p className="text-danger small">{errors.email}</p>}

        <MDBBtn type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </MDBBtn>
      </form>
    </MDBContainer>
  );
};

export default ForgotPasswordForm;
