import React, { useState } from "react";
import { Button, Modal, Form, Badge, Pagination } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

import "./InventoryList.css";

const InventoryList = () => {
  const generateRandomRating = () => {
    const ratings = ["Excelente", "Bom", "Regular", "Ruim"];
    const randomIndex = Math.floor(Math.random() * ratings.length);
    return ratings[randomIndex];
  };

  const generateRandomMaterial = (id) => {
    return {
      id,
      name: `Material ${String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      )}`,
      quantity: Math.floor(Math.random() * 20) + 1,
      condition: generateRandomRating(),
    };
  };

  const [inventory] = useState(
    Array.from({ length: 50 }, (_, index) => generateRandomMaterial(index + 1))
  );

  const [showModal, setShowModal] = useState(false);
  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const requestItem = () => {
    // Lógica para solicitar um item
    // ...
  };

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventory.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const columns = [
    { field: "name", headerName: "Nome do Item", width: 200 },
    { field: "quantity", headerName: "Quantidade", width: 150 },
    {
      field: "condition",
      headerName: "Estado",
      width: 150,
      renderCell: (params) => (
        <Badge className={getBadgeColor(params.value)}>{params.value}</Badge>
      ),
    },
  ];

  const getBadgeColor = (condition) => {
    switch (condition) {
      case "Bom":
        return "bg-success";
      case "Regular":
        return "bg-warning";
      case "Excelente":
        return "bg-primary";
      case "Ruim":
        return "bg-danger";
      // Adicione mais casos conforme necessário
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container4">
      <div className="space">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1> </h1>
          <div className="mt-4">
            <button
              className="btn btn-primary"
              onClick={handleModalShow}
            >
              <FontAwesomeIcon icon={faShoppingCart} /> Solicitar Item
            </button>
          </div>
        </div>
      </div>
      <DataGrid
        rows={currentItems}
        columns={columns}
        pageSize={itemsPerPage}
        pagination
        onPageChange={(params) => paginate(params.page)}
        components={{
          Pagination: CustomPagination,
        }}
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
