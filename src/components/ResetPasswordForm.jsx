import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MDBContainer, MDBInput, MDBBtn, MDBProgress } from "mdb-react-ui-kit";
import axios from "axios";

const ResetPasswordForm = () => {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

 
  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const validatePassword = (value) => {
    if (!value.trim()) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/\d/.test(value)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(value))
      return "Password must contain at least one special character (!@#$%^&*)";
    if (!strongPasswordRegex.test(value)) return "Password is too weak";
    return "";
  };

 
  const getPasswordStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[!@#$%^&*]/.test(value)) score++;
    return score; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validatePassword(password);
    if (errorMsg) {
      setErrors({ password: errorMsg });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/reset-password/${uidb64}/${token}/`,
        { password }
      );
      setMsg("✅ Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.error === "expired") {
        setMsg("❌ " + (errorData.message || "Your reset link has expired."));
        setTimeout(() => navigate("/forgot-password"), 4000);
      } else if (errorData.error === "invalid") {
        setMsg("❌ " + (errorData.message || "Invalid reset link."));
      } else if (errorData.password) {
        setErrors({ password: errorData.password[0] });
      } else {
        setMsg("❌ Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MDBContainer
      className="my-5 p-5 border rounded shadow"
      style={{ maxWidth: "500px" }}
    >
      <h4 className="mb-4 text-center">Reset Your Password</h4>

      {msg && (
        <div
          className={`alert ${
            msg.startsWith("✅") ? "alert-success" : "alert-danger"
          }`}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <MDBInput
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ password: validatePassword(e.target.value) });
          }}
          required
          className="mb-2"
        />
        {errors.password && (
          <p className="text-danger small">{errors.password}</p>
        )}

        {password && (
          <MDBProgress height="10">
            <MDBProgress
              bar
              value={(getPasswordStrength(password) / 4) * 100}
              color={
                getPasswordStrength(password) < 2
                  ? "danger"
                  : getPasswordStrength(password) === 2
                  ? "warning"
                  : "success"
              }
            />
          </MDBProgress>
        )}

        <MDBBtn type="submit" className="w-100 mt-3" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </MDBBtn>
      </form>
    </MDBContainer>
  );
};

export default ResetPasswordForm;
