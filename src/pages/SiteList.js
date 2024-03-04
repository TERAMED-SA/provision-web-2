/* eslint-disable react/style-prop-object */
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
    supervisorId: "",
    clientCode: "",
    name: "",
    address: "",
    location: {},
    mec: "",
    ctClient: "",
  });
  const [editingSite, setEditingSite] = useState(null);
  const sitePerPage = 5;

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
      const supervisorId = localStorage.getItem("supervisorId");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}companySite`,
        {
          supervisorId: supervisorId,
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
        supervisorId: "",
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
                ctClient: site.ctClient || "",
                idSite: site.costCenter,
              }))}
            columns={[
              { field: "id", headerName: "ID", width: 60 },
              { field: "name", headerName: "Nome", width: 200 },
              { field: "address", headerName: "Endereço", width: 200 },
              { field: "mec", headerName: "MEC", width: 150 },
              { field: "ctClient", headerName: "CT Client", width: 150 },
              {
                field: "actions",
                headerName: "Ações",
                width: 150,
                renderCell: (params) => (
                  <div>
                    <button
                      className="btn btn-primary btn-sm mr-2 mb-4"
                      onClick={() => handleOpenEditModal(params.row)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm mb-4"
                      onClick={() => handleDelete(params.row.idSite)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
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

          <div
            className={`modal fade ${isAddSiteModalOpen ? "show" : ""}`}
            style={{ display: isAddSiteModalOpen ? "block" : "none" }}
            tabIndex="-1"
            role="dialog"
            aria-labelledby="addSiteModal"
            aria-hidden={!isAddSiteModalOpen}
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="addSiteModal">
                    <FontAwesomeIcon icon={faPlus} /> Adicionar Novo Site
                  </h5>
                  <button
                    type="button"
                    className="btn btn-close"
                    onClick={handleCloseAddSiteModal}
                    aria-label="Fechar"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label className="text-black" htmlFor="siteName">
                        <FontAwesomeIcon icon={faEdit} /> Nome:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="siteName"
                        name="name"
                        value={newSite.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-black" htmlFor="siteAddress">
                        <FontAwesomeIcon icon={faEdit} /> Endereço:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="siteAddress"
                        name="address"
                        value={newSite.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-black" htmlFor="siteMec">
                        <FontAwesomeIcon icon={faEdit} /> MEC:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="siteMec"
                        name="mec"
                        value={newSite.mec}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-black" htmlFor="siteCtClient">
                        <FontAwesomeIcon icon={faEdit} /> CT Client:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="siteCtClient"
                        name="ctClient"
                        value={newSite.ctClient}
                        onChange={handleInputChange}
                      />
                    </div>
                  </form>
                </div>

                <div className="modal-footer">
                  <div className="d-flex">
                    <button
                      type="button"
                      className="btn btn-primary mr-2"
                      onClick={handleAddSite}
                    >
                      <FontAwesomeIcon icon={faSave} /> Adicionar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleCloseAddSiteModal}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isAddSiteModalOpen && (
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: "1050" }}
            ></div>
          )}

          {isEditModalOpen && (
            <div
              className={`modal fade ${isEditModalOpen ? "show" : ""}`}
              style={{ display: isEditModalOpen ? "block" : "none" }}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="editSiteModal"
              aria-hidden={!isEditModalOpen}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="editSiteModal">
                      <FontAwesomeIcon icon={faEdit} /> Editar Site
                    </h5>
                    <button
                      type="button"
                      className="btn btn-close"
                      onClick={handleCloseEditModal}
                      aria-label="Fechar"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <div className="form-group">
                        <label className="text-black" htmlFor="editSiteName">
                          <FontAwesomeIcon icon={faEdit} /> Nome:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="editSiteName"
                          name="name"
                          value={editingSite.name}
                          onChange={(e) =>
                            handleEditInputChange(e, editingSite._id)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-black" htmlFor="editSiteAddress">
                          <FontAwesomeIcon icon={faEdit} /> Endereço:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="editSiteAddress"
                          name="address"
                          value={editingSite.address}
                          onChange={(e) =>
                            handleEditInputChange(e, editingSite._id)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-black" htmlFor="editSiteMec">
                          <FontAwesomeIcon icon={faEdit} /> MEC:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="editSiteMec"
                          name="mec"
                          value={editingSite.mec}
                          onChange={(e) =>
                            handleEditInputChange(e, editingSite._id)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="text-black"
                          htmlFor="editSiteCtClient"
                        >
                          <FontAwesomeIcon icon={faEdit} /> CT Client:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="editSiteCtClient"
                          name="ctClient"
                          value={editingSite.ctClient}
                          onChange={(e) =>
                            handleEditInputChange(e, editingSite._id)
                          }
                        />
                      </div>
                    </form>
                  </div>

                  <div className="modal-footer">
                    <div className="d-flex">
                      <button
                        type="button"
                        className="btn btn-primary mr-2"
                        onClick={handleEditSite}
                      >
                        <FontAwesomeIcon icon={faSave} /> Salvar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleCloseEditModal}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditModalOpen && (
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: "1050" }}
            ></div>
          )}
        </>
      )}
    </div>
  );
}

export default SiteList;
