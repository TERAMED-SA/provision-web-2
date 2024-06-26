import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import {
  faEdit,
  faTrash,
  faPlus,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdHomeRepairService } from "react-icons/md";

function SiteList() {
  const [siteList, setSiteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newSite, setNewSite] = useState({
    clientCode: "",
    name: "",
    address: "",
    location: {},
    mec: "",
    ctClient: "",
  });
  const [editingSite, setEditingSite] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const sitePerPage = 5;
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleOpenAddSiteModal = () => {
    setIsAddSiteModalOpen(true);
  };

  const handleCloseAddSiteModal = () => {
    setIsAddSiteModalOpen(false);
  };

  const handleOpenEditModal = (site) => {
    setEditingSite(site);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingSite(null);
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSite((prevSite) => ({ ...prevSite, [name]: value }));
  };

  const handleEditInputChange = (e, siteId) => {
    const { name, value } = e.target;
    setEditingSite((prevSite) => ({
      ...prevSite,
      [name]: value,
      _id: siteId,
    }));
  };

  const handleAddSite = async () => {
    try {
      const clientCode = localStorage.getItem("selectedCompany");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}companySite/create/${clientCode}/1162`,
        {
          name: newSite.name,
          address: newSite.address,
          location: newSite.location,
          mec: newSite.mec,
          ctClient: newSite.ctClient,
        }
      );

      setSiteList((prevList) => [...prevList, response.data.data]);
      toast.success("Site adicionado com sucesso!");
    } catch (error) {
      console.error("Error adding site:", error.message);
      console.log(error);
      toast.error("Erro ao adicionar o site. Por favor, tente novamente.");
    } finally {
      setIsAddSiteModalOpen(false);
      setNewSite({
        clientCode: "",
        name: "",
        address: "",
        location: {},
        mec: "",
        ctClient: "",
      });
    }
  };

  const handleEditSite = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}companySite/${editingSite._id}`,
        editingSite
      );

      setSiteList((prevList) =>
        prevList.map((site) =>
          site._id === editingSite._id ? response.data.data : site
        )
      );
      toast.success("Site editado com sucesso!");
    } catch (error) {
      console.error("Error editing site:", error.message);
      toast.error("Erro ao editar o site. Por favor, tente novamente.");
    } finally {
      setIsEditModalOpen(false);
      setEditingSite(null);
    }
  };

  const handleDelete = async (siteId) => {
    toast.error("Você não tem permissão para excluir.");
    /*
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}companySite/${siteId}`
      );
      setSiteList((prevList) => prevList.filter((site) => site._id !== siteId));
      toast.success("Site excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting site:", error.message);
      toast.error("Erro ao excluir o site. Por favor, tente novamente.");
    }
    */
  };

  const handleSiteClick = async (site) => {
    try {
      window.location.href = `/equipmentList?costCenter=${site.costCenter}`; // Redirecionar para EquipmentList com o costCenter na URL
    } catch (error) {
      console.error("Error redirecting:", error.message);
    }
  };

  const handleEquipmentClick = (equipment) => {
    setSelectedEquipment(equipment);
    document.getElementById("equipmentModal").classList.add("show");
    document.getElementById("equipmentModal").style.display = "block";
  };

  async function fetchSites() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}companySite?size=500`
      );
      const clientCode = localStorage.getItem("selectedCompany");
      const filteredSites = response.data.data.data.filter(
        (site) => clientCode === site.clientCode
      );
      setSiteList(filteredSites);
    } catch (error) {
      console.error("Error fetching sites:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSites();
  }, []);

  return (
    <div className="container4">
      <h1 style={{ textAlign: "center" }}>Lista dos sites</h1>
      <div className="space">
        <div className=""></div>
        <div className="">
          <button
            className="btn btn-primary mb-3 btn-add-site"
            onClick={handleOpenAddSiteModal} // Adicione os parênteses aqui
          >
            <FontAwesomeIcon icon={faPlus} /> Adicionar Site
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center mt-4">
          <CircularProgress size={80} thickness={5} />
        </div>
      )}

      {!isLoading && siteList.length === 0 && (
        <div className="text-center text-black mt-4">
          Nenhum dado disponível, este cliente ainda não possui Sites
        </div>
      )}

      {!isLoading && siteList.length > 0 && (
        <DataGrid
          rows={siteList.map((site, index) => ({
            id: index + 1,
            name: site.name || "",
            address: site.address || "",
            mec: site.mec || "",
            ctClient: site.ctClient || "",
            costCenter: site.costCenter || "", // Adicionando a coluna costCenter
            idSite: site.costCenter,
          }))}
          columns={[
            { field: "id", headerName: "ID", width: 60 },
            { field: "name", headerName: "Nome", width: 800 },
            { field: "address", headerName: "Endereço", width: 200 },
            { field: "mec", headerName: "MEC", width: 150 },
            { field: "ctClient", headerName: "CT Client", width: 150 },
            { field: "costCenter", headerName: "Cost Center", width: 150 },
            {
              field: "actions",
              headerName: "Ações",
              width: 250,
              renderCell: (params) => (
                <div>
                  <button
                    className="btn btn-primary btn-sm mr-2 mb-2"
                    onClick={() => handleOpenEditModal(params.row)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm mr-2 mb-2"
                    onClick={() => handleDelete(params.row.idSite)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button className="btn btn-success btn-sm mr-2 mb-2">
                    <a
                      href={`/equipmentList?costCenter=${params.row.idSite}`}
                      style={{ color: "white" }}
                    >
                      <MdHomeRepairService />
                    </a>
                  </button>
                </div>
              ),
            },
          ]}
          pageSize={sitePerPage}
          rowCount={siteList.length}
          pagination
          onPageChange={handlePageChange}
        />
      )}

      <Modal show={isAddSiteModalOpen} onHide={handleCloseAddSiteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Site</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name" // Adicionado name para o input
              value={newSite.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Endereço:</label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address" // Adicionado name para o input
              value={newSite.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="mec">MEC:</label>
            <input
              type="text"
              className="form-control"
              id="mec"
              name="mec" // Adicionado name para o input
              value={newSite.mec}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ctClient">CT Client:</label>
            <input
              type="text"
              className="form-control"
              id="ctClient"
              name="ctClient" // Adicionado name para o input
              value={newSite.ctClient}
              onChange={handleInputChange}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddSiteModal}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleAddSite}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Equipment Modal */}
      <Modal
        show={selectedEquipment !== null}
        onHide={() => setSelectedEquipment(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Equipamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Nome:</strong> {selectedEquipment && selectedEquipment.name}
          </p>
          <p>
            <strong>Número de Série:</strong>{" "}
            {selectedEquipment && selectedEquipment.serialNumber}
          </p>
          <p>
            <strong>Data de Criação:</strong>{" "}
            {selectedEquipment && selectedEquipment.createdAt}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSelectedEquipment(null)}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
}

export default SiteList;