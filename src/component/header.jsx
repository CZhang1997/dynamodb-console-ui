import React, { useContext, useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";

import AppContext from "../context/app-context";

function Header() {
  const navigate = useNavigate();
  const {} = useContext(AppContext);
  const isMobile = window.innerWidth < 700;
  return (
    <header>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand onClick={() => {}}>
            <Card.Img
              variant="top"
              src={isMobile ? "favicon.ico" : "/apple-touch-icon.png"}
              width={isMobile ? undefined : "35px"}
              height={isMobile ? undefined : "35px"}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate("/")}>Home</Nav.Link>
              <Nav.Link onClick={() => navigate("/consoles")}>
                Consoles
              </Nav.Link>
            </Nav>
            {/* <Nav>
              {<Nav.Link onClick={() => navigate("/about")}>About</Nav.Link>}
            </Nav> */}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* <LoginModel showModal={true} /> */}
    </header>
  );
}

export default Header;
