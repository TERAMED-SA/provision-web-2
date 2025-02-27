import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, Form } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    email: "",
    position: "",
  });

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/user"
        );
        const employeeData = response.data.data.data.map((employee) => ({
          id: employee._id,
          name: employee.name,
          phoneNumber: employee.phoneNumber,
          address: employee.address,
          email: employee.email,
          position: employee.type,
        }));
        setEmployees(employeeData);
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error.message);
      }
    }
    fetchEmployees();
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      name: "",
      phoneNumber: "",
      address: "",
      email: "",
      position: "",
    });
  };

  const handleModalShow = () => {
    setShowModal(true);
  };

  const addEmployee = () => {
    handleModalShow();
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter((employee) => employee.id !== id));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddEmployee = () => {
    // Aqui você pode adicionar a lógica para adicionar o funcionário
    console.log("Dados do novo funcionário:", formData);
    handleModalClose();
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
      <h2 style={{ fontSize: "45px" , textAlign: "center"}}> Funcionários </h2>
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
        rows={currentEmployees.map((employee) => ({
          ...employee,
          actions: (
            <Trash
              onClick={() => removeEmployee(employee.id)}
              style={{ cursor: "pointer" }}
            />
          ),
        }))}
        columns={[
          { field: "name", headerName: "Nome", width: 200 },
          { field: "phoneNumber", headerName: "Telefone", width: 150 },
          { field: "address", headerName: "Site", width: 300 },
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
              <Form.Label style={{ color: "black" }}>Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmployeePhoneNumber">
              <Form.Label style={{ color: "black" }}>Telefone</Form.Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmployeeAddress">
              <Form.Label style={{ color: "black" }}>Endereço</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmployeeEmail">
              <Form.Label style={{ color: "black" }}>E-mail</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmployeePosition">
              <Form.Label style={{ color: "black" }}>Cargo</Form.Label>
              <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleAddEmployee}
              style={{ background: "#1d09b2;", border: "1px solid" }}
            >
              Adicionar
            </Button>{" "}
            <Button variant="secondary" onClick={handleModalClose}>
              Cancelar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeList;
