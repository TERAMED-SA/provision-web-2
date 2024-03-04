/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function EquipmentList() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] =
    useState(false);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false); // Fixed state variable name
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
    // Renamed function to be more descriptive
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
      const companyId = process.env.REACT_APP_COMPANY_ID; // Replace with the correct environment variable name
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}equipment`,
        {
          companyId: companyId,
          name: equipmentData.name,
          quantity: equipmentData.quantity,
          // Add other fields as needed
        }
      );

      fetchEquipment();
    } catch (error) {
      console.error("Error adding equipment:", error.message);
    } finally {
      // Close the modal, regardless of the request result
      handleCloseAddEquipmentModal();
    }
  };

  async function fetchEquipment() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}equipment?size=50`
      );
      const filterCompany = localStorage.getItem("selectedCompany");
      const filteredEquipmentList = await Promise.all(
        response.data.data.data.map(async (item) => {
          const result = await validateSite(`${item.costCenter}`);
          if (result.clientCode === filterCompany) {
            item.siteCode = result.name;
            return item;
          }
          return null;
        })
      );

      setEquipmentList(filteredEquipmentList.filter(Boolean));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Resource not found. This position does not exist.");
      } else {
        console.error("Unknown error:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function validateSite(costCenter) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}companySite/${costCenter}`
      );
      return {
        name: response.data.data.name,
        clientCode: response.data.data.clientCode,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Resource not found.");
      } else {
        console.error("Unknown error:", error.message);
      }
    }
  }

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "name", headerName: "Nome", width: 200 },
    { field: "state", headerName: "Estado", width: 200 },
    { field: "serialNumber", headerName: "Serial number", width: 200 },
    { field: "site", headerName: "Site", width: 200 },
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
            <h1> </h1>
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
              No data available, this client does not have any equipment.
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
                    name: equipment.name || "",
                    state: equipment.state,
                    site: equipment.siteCode,
                    serialNumber: equipment.serialNumber,
                    idSite: equipment._id, // Certifique-se de incluir o identificador exclusivo do equipamento
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
                  <Modal.Title>Adicionar novo equipamento</Modal.Title>{" "}
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
                        onChange={handleInputChange} // Assuming there's an undefined handleInputChange function
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
