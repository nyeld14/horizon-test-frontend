import React from "react";
import { MDBBtn } from "mdb-react-ui-kit";

const CustomButton = ({
  label,
  onClick,
  type = "button",
  color = "primary",
  className = "",
  ...props
}) => {
  return (
    <MDBBtn
      type={type}
      color={color}
      onClick={onClick}
      rippleColor="none"
      className={`no-click-effect ${className}`}
      {...props}
    >
      {label}
    </MDBBtn>
  );
};

export default CustomButton;
