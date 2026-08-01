import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { FileUploader } from "react-drag-drop-files";
import Select from "react-select";

export function isValidEmail(email) {
  // Regular expression to check the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidNumber(value) {
  return !Number.isNaN(Number(value));
}

export const INPUT_TYPE = {
  TEXT: "TEXT",
  PASSWORD: "PASSWORD",
  EMAIL: "EMAIL",
  TEXT_AREA: "TEXT_AREA",
  SELECT: "SELECT",
  FILE: "FILE",
  DATE: "DATE",
  NUMBER: "NUMBER",
};

export const EditableModal = (props) => {
  const {
    actionLabel,
    actionOnClick,
    title,
    configs = [],
    currentValue,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(currentValue);
  const [errMsg, setErrMsg] = useState("");
  useEffect(() => {
    setData(
      configs.reduce(
        (accumulate, item) => ({
          ...accumulate,
          [item.fieldName]: currentValue[item.fieldName] || "",
        }),
        {}
      )
    );
  }, [showModal]);

  const onChange = (e) => {
    setData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  var modalBody = (
    <div>
      <Form>
        {configs.map((item) => {
          // const item = configs.find((config) => config.fieldName == attr);
          const { fieldName, label, inputType, placeHolder } = item;
          switch (inputType) {
            case INPUT_TYPE.TEXT:
            case INPUT_TYPE.EMAIL:
            case INPUT_TYPE.PASSWORD:
              return (
                <div key={fieldName}>
                  <Form.Label>{label}</Form.Label>
                  <div style={{ display: "flex" }}>
                    <Form.Control
                      type={
                        inputType === INPUT_TYPE.PASSWORD ? "password" : "text"
                      }
                      id={fieldName}
                      value={data[fieldName]}
                      onChange={onChange}
                      placeholder={placeHolder}
                    />
                  </div>
                </div>
              );
            case INPUT_TYPE.NUMBER:
              return (
                <div key={fieldName}>
                  <Form.Label>{label}</Form.Label>
                  <div style={{ display: "flex" }}>
                    <Form.Control
                      type="number"
                      id={fieldName}
                      value={data[fieldName]}
                      onChange={onChange}
                    />
                  </div>
                </div>
              );
            case INPUT_TYPE.TEXT_AREA:
              return (
                <div key={fieldName}>
                  <Form.Label>{label}</Form.Label>
                  <div style={{ display: "flex" }}>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      id={fieldName}
                      value={data[fieldName]}
                      onChange={onChange}
                      placeholder={placeHolder}
                    />
                  </div>
                </div>
              );
            case INPUT_TYPE.DATE:
              return (
                <div key={fieldName}>
                  <Form.Label>{label}</Form.Label>
                  <div style={{ display: "flex" }}>
                    <Form.Control
                      type="date"
                      id={fieldName}
                      value={data[fieldName]}
                      onChange={onChange}
                    />
                  </div>
                </div>
              );
            case INPUT_TYPE.SELECT:
              return (
                <div key={fieldName}>
                  <Form.Label>{label}</Form.Label>
                  <div style={{ display: "flex" }}>
                    <Select
                      options={item.enumValues}
                      onChange={(val) =>
                        setData((prevState) => ({
                          ...prevState,
                          [fieldName]: val,
                        }))
                      }
                      value={data[fieldName]}
                    />
                  </div>
                </div>
              );
            case INPUT_TYPE.FILE:
              return (
                <div key={fieldName}>
                  <Form.Label>{label}</Form.Label>
                  <div style={{ display: "flex" }}>
                    <FileUploader
                      handleChange={(file) => {
                        console.log(file);
                        setData({
                          ...data,
                          [fieldName]: file,
                        });
                      }}
                      multiple={false}
                      hoverTitle={"Drop the videos here"}
                      types={item.fileTypes}
                    />
                  </div>
                </div>
              );
          }
          return (
            <div className="form-group" key={fieldName}>
              NOT SUPPORTED INPUT
            </div>
          );
        })}
      </Form>
    </div>
  );
  return !showModal ? (
    <div>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        {title}
      </Button>
    </div>
  ) : (
    <div>
      <Modal show={showModal}>
        <Modal.Header closeButton onClick={() => setShowModal(false)}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {modalBody} <div style={{ color: "red" }}>{errMsg}</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="dark"
            onClick={() => {
              var msg = "";
              var updatedValues = {};
              for (var i = 0; i < configs.length; i++) {
                const config = configs[i];
                const { required, fieldName, label, inputType } = config;
                const fieldValue = data[fieldName];
                const currentFieldValue = currentValue[fieldName];
                if (required && (!fieldValue || fieldValue.length === 0)) {
                  msg += `--- ${label} cannot be empty. ---`;
                }
                if (
                  inputType === INPUT_TYPE.EMAIL &&
                  !isValidEmail(fieldValue)
                ) {
                  msg += `--- ${label} must be in the format of email. ---`;
                } else if (
                  inputType === INPUT_TYPE.NUMBER &&
                  !isValidNumber(fieldValue)
                ) {
                  msg += `--- ${label} must be number. ---`;
                }
                if (
                  currentFieldValue !== fieldValue ||
                  currentFieldValue?.name !== fieldValue?.name
                ) {
                  updatedValues = {
                    ...updatedValues,
                    [fieldName]: fieldValue,
                  };
                }
              }
              if (msg.length > 0) {
                setErrMsg(msg);
                return;
              }
              actionOnClick(updatedValues);
              setShowModal(false);
              setData({});
            }}
          >
            {actionLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
