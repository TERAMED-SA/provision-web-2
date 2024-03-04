/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, Form } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import { DataGrid } from "@mui/x-data-grid";


const generateRandomId = () => Math.floor(Math.random() * 1000);

const generateRandomEmployee = () => {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Emily",
    "Daniel",
    "Olivia",
    "William",
    "Ava",
    "James",
    "Sophia",
  ];
  const lastNames = [
    "Doe",
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Martinez",
    "Rodriguez",
    "Hernandez",
  ];
  const positions = ["Manager", "Supervisor", "Associate", "Assistant"];
  return {
    id: generateRandomId(),
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    address: `${Math.floor(Math.random() * 1000) + 1} Street, City, State`,
    position: positions[Math.floor(Math.random() * positions.length)],
  };
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState(
    Array(20).fill(null).map(generateRandomEmployee)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const inputRef = useRef(null);

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEmployee("");
    inputRef.current.value = "";
  };
  const handleModalShow = () => {
    setShowModal(true);
  };

  const addEmployee = () => {
    handleModalShow();
  };
  const removeEmployee = (index) => {
    setEmployees(employees.filter((employee, i) => i !== index));
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  return (
    <div className="container4">
      <div className="container-fluid"></div>
      <div className="space">
        <div className="d-flex justify-content-between align-items-center"></div>
        <div className=" mb-2">
          <Button
            className="btn btn-primary"
            style={{ border: "1px solid " }}
            onClick={addEmployee}
          >
            Adicionar Funcionário
          </Button>
        </div>
      </div>
      <DataGrid
        rows={currentEmployees.map((employee, index) => ({
          id: index,
          name: `${employee.firstName} ${employee.lastName}`,
          address: employee.address,
          position: employee.position,
          actions: (
            <Trash
              onClick={() => removeEmployee(index)}
              style={{ cursor: "pointer" }}
            />
          ),
        }))}
        columns={[
          { field: "name", headerName: "Nome", width: 200 },
          { field: "address", headerName: "Endereço", width: 300 },
          { field: "position", headerName: "Cargo", width: 150 },
          {
            field: "actions",
            headerName: "Ações",
            width: 100,
            renderCell: (params) => params.value,
          },
        ]}
        pageSize={employeesPerPage}
        pagination
        onPageChange={(params) => handlePageChange(params.page)}
        rowCount={employees.length}
      />
      <Modal
        show={showModal}
        onHide={handleModalClose}
        style={{ backgroundColor: "" }}
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#1d09b2;", border: "1px solid" }}
        >
          <Modal.Title>Adicionar Funcionário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formEmployeeName">
              <Form.Label style={{ color: "black" }}>
                Nome do Funcionário
              </Form.Label>
              <div></div>
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleModalClose}
              style={{ background: "#1d09b2;", border: "1px solid" }}
            >
              Adicionar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeList;
