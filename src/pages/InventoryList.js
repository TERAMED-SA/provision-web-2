import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Pagination } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

import "./InventoryList.css";

const InventoryList = () => {
  const [occurrences, setOccurrences] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchOccurrences() {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/occurrence/"
        );
        setOccurrences(response.data.data.data);
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error.message);
      }
    }
    fetchOccurrences();
  }, []);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const requestItem = () => {
    // Lógica para solicitar um item
    // ...
  };

  const itemsPerPage = 5;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const columns = [
    { field: "_id", headerName: "ID", width: 150 },
    { field: "name", headerName: "Nome", width: 200 },
    { field: "createdAt", headerName: "Data de Criação", width: 200 },
    { field: "details", headerName: "Detalhes", width: 400 },
  ];

  return (
    <div className="container4">
      <div className="container-fluid">
        <h2 style={{ fontSize: "45px" }}> Ocorrências </h2>
      </div>
      <div className="space">
        <div className="col-12 d-flex justify-content-between align-items-center"></div>
      </div>
      <DataGrid
        rows={occurrences}
        columns={columns}
        pageSize={itemsPerPage}
        pagination
        onPageChange={(params) => paginate(params.page)}
        components={{
          Pagination: CustomPagination,
        }}
        getRowId={(row) => row._id}
      />

      <Modal
        show={showModal}
        onHide={handleModalClose}
        className="custom-modal"
        style={{ backgroundColor: "transparent", border: "none" }}
      >
        <Modal.Header
          closeButton
          className="modal-header"
          style={{
            backgroundColor: "#1d09b2;",
          }}
        >
          <Modal.Title className="modal-title">Solicitar Item</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="modal-body"
          style={{ backgroundColor: "transparent" }}
        >
          <Form>
            <Form.Group controlId="formItemName">
              <Form.Label style={{ color: "black" }}>Nome do Item</Form.Label>
              <Form.Control type="text" placeholder="Digite o nome do item" />
            </Form.Group>
            <Form.Group controlId="formQuantity">
              <Form.Label style={{ color: "black" }}>Quantidade</Form.Label>
              <Form.Control
                type="number"
                placeholder="Digite a quantidade desejada"
              />
            </Form.Group>
          </Form>

          <Button variant="primary" onClick={requestItem}>
            Solicitar
          </Button>
          <Button variant="danger" onClick={handleModalClose}>
            Fechar
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const CustomPagination = (props) => {
  return (
    <Pagination className="justify-content-end">
      <Pagination.Prev
        onClick={() => props.onPageChange && props.onPageChange(props.page - 1)}
      />
      {Array.from({ length: Math.ceil(props.rowCount / props.pageSize) }).map(
        (_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === props.page}
            onClick={() => props.onPageChange && props.onPageChange(index + 1)}
            style={{ backgroundColor: "#602f81", color: "#ededed" }}
          >
            {index + 1}
          </Pagination.Item>
        )
      )}
      <Pagination.Next
        onClick={() => props.onPageChange && props.onPageChange(props.page + 1)}
      />
    </Pagination>
  );
};

export default InventoryList;