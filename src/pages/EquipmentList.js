import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

function EquipmentList() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] =
    useState(false);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [editingEquipmentData, setEditingEquipmentData] = useState({
    name: "",
    quantity: 0,
  });
  const [equipmentData, setEquipmentData] = useState({
    name: "",
    quantity: 0,
  });
  const equipmentPerPage = 5;

  const handleOpenEditEquipmentModal = (equipment) => {
    if (equipment && equipment.name) {
      setEditingEquipmentData({
        name: equipment.name,
        quantity: equipment.quantity,
      });
      setIsEditEquipmentModalOpen(true);
    } else {
      console.error("Erro ao abrir o modal de edição: dados inválidos");
    }
  };

  const handleCloseEditEquipmentModal = () => {
    setIsEditEquipmentModalOpen(false);
  };

  const handleEditEquipmentInputChange = (event) => {
    const { name, value } = event.target;
    setEditingEquipmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleRowClick = (params) => {
    setSelectedEquipment(params.row);
  };

  const handleOpenAddEquipmentModal = () => {
    setIsAddEquipmentModalOpen(true);
  };

  const handleCloseAddEquipmentModal = () => {
    setIsAddEquipmentModalOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEquipmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddEquipment = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}equipment`,
        {
          name: equipmentData.name,
          quantity: equipmentData.quantity,
          // Add other fields as needed
        }
      );
      fetchEquipment();
    } catch (error) {
      console.error("Error adding equipment:", error.message);
    } finally {
      handleCloseAddEquipmentModal();
    }
  };

  async function fetchEquipment() {
    try {
      setIsLoading(true);
      console.log(response.data);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}equipment`
      );
      const formattedEquipmentList = response.data.data.data.map(
        (equipment) => ({
          ...equipment,
          createdAt: format(new Date(equipment.createdAt), "dd/MM/yyyy"),
          updatedAt: format(new Date(equipment.updatedAt), "dd/MM/yyyy"),
          deletedAt: format(new Date(equipment.deletedAt), "dd/MM/yyyy"),
        })
      );
      setEquipmentList(formattedEquipmentList);
    } catch (error) {
      console.error("Error :", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEquipment();
  }, []);

  const columns = [
    { field: "createdAt", headerName: "Criado em", width: 200 },
    { field: "name", headerName: "Nome", width: 200 },
    { field: "quantity", headerName: "Quantidade", width: 200 },
    { field: "serialNumber", headerName: "Número de série", width: 200 },
    { field: "state", headerName: "Estado", width: 200 },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (params) => (
        <div className="d-flex justify-content-center align-items-center">
          <button
            className="btn btn-primary btn-sm mr-2 mb-4"
            onClick={() => handleOpenEditEquipmentModal(params.row)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className="btn btn-danger btn-sm mb-4"
            onClick={() => console.log("Remover:", params.row)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container4">
      <div className="container-fluid">
        <div className="space">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h1>Equipamentos</h1>
            <button
              className="btn btn-primary mb-3 btn-add-equipment"
              onClick={handleOpenAddEquipmentModal}
            >
              <FontAwesomeIcon icon={faPlus} /> Adicionar equipamento
            </button>
          </div>
        </div>

        <>
          {isLoading && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CircularProgress size={80} thickness={5} />
            </div>
          )}
          {!isLoading && equipmentList.length === 0 && (
            <div
              style={{ textAlign: "center", color: "black", padding: "20px" }}
            >
              Sem dados disponíveis, este cliente não possui nenhum equipamento.
            </div>
          )}
          {!isLoading && equipmentList.length > 0 && (
            <>
              <DataGrid
                rows={equipmentList
                  .slice(
                    pageNumber * equipmentPerPage,
                    pageNumber * equipmentPerPage + equipmentPerPage
                  )
                  .map((equipment, index) => ({
                    id: index + 1,
                    ...equipment,
                  }))}
                columns={columns}
                pageSize={equipmentPerPage}
                rowCount={equipmentList.length}
                pagination
                onPageChange={handlePageChange}
                onRowClick={handleRowClick}
              />

              <Modal
                show={isAddEquipmentModalOpen}
                onHide={handleCloseAddEquipmentModal}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Adicionar novo equipamento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <form>
                    <div className="form-group">
                      <label className="text-black" htmlFor="equipmentName">
                        Nome do equipamento
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="equipmentName"
                        name="name"
                        value={equipmentData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-black" htmlFor="equipmentQuantity">
                        Quantidade
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="equipmentQuantity"
                        name="quantity"
                        value={equipmentData.quantity}
                        onChange={handleInputChange}
                      />
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary mt-2" onClick={handleAddEquipment}>
                    Adicionar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleCloseAddEquipmentModal}
                  >
                    Cancelar
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}
          <Modal
            show={isEditEquipmentModalOpen}
            onHide={handleCloseEditEquipmentModal}
          >
            <Modal.Header closeButton>
              <Modal.Title>Editar equipamento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className="form-group">
                  <label className="text-black" htmlFor="editEquipmentName">
                    Nome do equipamento
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editEquipmentName"
                    name="name"
                    value={editingEquipmentData.name}
                    onChange={handleEditEquipmentInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="text-black" htmlFor="editEquipmentQuantity">
                    Quantidade
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editEquipmentQuantity"
                    name="quantity"
                    value={editingEquipmentData.quantity}
                    onChange={handleEditEquipmentInputChange}
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary mt-2"
                onClick={handleOpenEditEquipmentModal}
              >
                Salvar
              </Button>
              <Button variant="danger" onClick={handleCloseEditEquipmentModal}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      </div>
    </div>
  );
}

export default EquipmentList;