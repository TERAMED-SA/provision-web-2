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
        `${process.env.REACT_APP_API_URL}companySite`,
        {
          clientCode: clientCode,
          name: newSite.name,
          address: newSite.address,
          location: newSite.location,
          mec: newSite.mec,
          ctClient: newSite.ctClient,
        }
      );

      setSiteList((prevList) => [...prevList, response.data.data]);
    } catch (error) {
      console.error("Error adding site:", error.message);
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
    } catch (error) {
      console.error("Error editing site:", error.message);
    } finally {
      setIsEditModalOpen(false);
      setEditingSite(null);
    }
  };

  const handleDelete = async (siteId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}companySite/${siteId}`
      );
      setSiteList((prevList) => prevList.filter((site) => site._id !== siteId));
    } catch (error) {
      console.error("Error deleting site:", error.message);
    }
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
      <div className="space">
        <div className=""></div>
        <div className="">
          <button
            className="btn btn-primary mb-3 btn-add-site"
            onClick={handleOpenAddSiteModal}
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
        <>
          <DataGrid
            rows={siteList
              .slice(
                pageNumber * sitePerPage,
                pageNumber * sitePerPage + sitePerPage
              )
              .map((site, index) => ({
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
              { field: "name", headerName: "Nome", width: 200 },
              { field: "address", headerName: "Endereço", width: 200 },
              { field: "mec", headerName: "MEC", width: 150 },
              { field: "ctClient", headerName: "CT Client", width: 150 },
              { field: "costCenter", headerName: "Cost Center", width: 150 }, // Definindo a coluna Cost Center
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
                        Ver
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

          <div className="modal fade" id="equipmentModal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Detalhes do Equipamento:{" "}
                    {selectedEquipment && selectedEquipment.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => {
                      document
                        .getElementById("equipmentModal")
                        .classList.remove("show");
                      document.getElementById("equipmentModal").style.display =
                        "none";
                      setSelectedEquipment(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Nome:</strong>{" "}
                    {selectedEquipment && selectedEquipment.name}
                  </p>
                  <p>
                    <strong>Número de Série:</strong>{" "}
                    {selectedEquipment && selectedEquipment.serialNumber}
                  </p>
                  <p>
                    <strong>Data de Criação:</strong>{" "}
                    {selectedEquipment && selectedEquipment.createdAt}
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => {
                      document
                        .getElementById("equipmentModal")
                        .classList.remove("show");
                      document.getElementById("equipmentModal").style.display =
                        "none";
                      setSelectedEquipment(null);
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SiteList;