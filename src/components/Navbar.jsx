import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MDBNavbar,
  MDBContainer,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBCollapse,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBIcon,
  MDBBtn
} from 'mdb-react-ui-kit';

const Navbar = () => {
  const navigate = useNavigate();
  const [openNav, setOpenNav] = useState(false);

  const userName = localStorage.getItem('user_name');
  const userRole = localStorage.getItem('user_role');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    navigate('/');
  };

  return (
    <MDBNavbar expand='lg' dark bgColor='dark'>
      <MDBContainer fluid>
        <MDBNavbarBrand>VRM</MDBNavbarBrand>
        <MDBNavbarToggler
          type='button'
          aria-expanded='false'
          aria-label='Toggle navigation'
          onClick={() => setOpenNav(!openNav)}
        >
          <MDBIcon icon='bars' fas />
        </MDBNavbarToggler>
        <MDBCollapse navbar open={openNav}>
          <MDBNavbarNav className='ms-auto d-flex align-items-center gap-2'>

            {userName ? (
              <>
                <MDBNavbarItem>
                  <span className='text-white small'>Welcome, {userName}</span>
                </MDBNavbarItem>
                <MDBNavbarItem>
                  <span className='text-secondary small'>({userRole})</span>
                </MDBNavbarItem>
                <MDBNavbarItem>
                  <MDBBtn color='danger' size='sm' onClick={handleLogout}>
                    Logout
                  </MDBBtn>
                </MDBNavbarItem>
              </>
            ) : (
              <>
                <MDBNavbarItem>
                  <MDBNavbarLink as={Link} to="/login">
                    <MDBBtn outline color='light' size='sm'>
                      Login
                    </MDBBtn>
                  </MDBNavbarLink>
                </MDBNavbarItem>
                <MDBNavbarItem>
                  <MDBNavbarLink as={Link} to="/register">
                    <MDBBtn outline color='light' size='sm'>
                      Register
                    </MDBBtn>
                  </MDBNavbarLink>
                </MDBNavbarItem>
              </>
            )}

          </MDBNavbarNav>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
};

export default Navbar;
