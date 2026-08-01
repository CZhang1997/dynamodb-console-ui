import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const TableDetailsModal = ({ show, onClose, data }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Table schema</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          as="textarea"
          rows={10}
          value={JSON.stringify(data, null, 2)}
          readOnly
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TableDetailsModal;
