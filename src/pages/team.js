import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faSave,
  faTimes,
  faMapMarkerAlt,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import Avatar from "react-avatar";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import { Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const Team = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [type, setType] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [usersPerPage, setUsersPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);
  const [siteSearchTerm, setSiteSearchTerm] = useState("");
  const [isAssignSiteModalOpen, setIsAssignSiteModalOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [userToAssignSite, setUserToAssignSite] = useState(null);

  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [userSite, setUserSite] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const safeSites = Array.isArray(sites) ? sites : [];

  // Estilos para a modal de sites
  const modalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "60%",
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
      borderRadius: "10px",
      padding: "30px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  };

  const tableContainerStyles = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  };

  const tableHeaderStyles = {
    backgroundColor: "#5c3aff",
    color: "#fff",
    textAlign: "center",
    padding: "10px",
  };

  const tableRowStyles = {
    textAlign: "center",
    borderBottom: "1px solid #ddd",
  };

  const tableCellStyles = {
    padding: "10px",
  };

  const buttonContainerStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  };

  const buttonStyles = {
    padding: "10px 20px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  const prevButtonStyles = {
    ...buttonStyles,
    backgroundColor: "#6c757d",
    color: "#fff",
  };

  const nextButtonStyles = {
    ...buttonStyles,
    backgroundColor: "#6c757d",
    color: "#fff",
  };

  const closeButtonStyles = {
    position: "absolute",
    top: "-70px",
    right: "-30px",
    background: "transparent",
    border: "none",
    fontSize: "44px",
    cursor: "pointer",
    color: "#000",
  };

  useEffect(() => {
    fetchUsers();
    fetchSites();
    if (isSiteModalOpen) {
      setCurrentPage(1);
    }
  }, []);

  useEffect(() => {
    if (isSiteModalOpen) {
      setCurrentPage(1);
    }
  }, [isSiteModalOpen, userSite]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user?size=500`
      );
      if (response.data && Array.isArray(response.data.data.data)) {
        setUsers(response.data.data.data);
        setFilteredUsers(response.data.data.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Erro:", error.message);
      setIsLoading(false);
    }
  }

  async function fetchSites() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}companySite?size=500`
      );
      if (response.data && Array.isArray(response.data.data.data)) {
        setSites(response.data.data.data);
      } else {
        console.error("A resposta da API não contém um array de sites.");
        setSites([]); // Garante que sites seja um array vazio em caso de erro
      }
    } catch (error) {
      console.error("Erro ao buscar sites:", error.message);
      setSites([]); // Garante que sites seja um array vazio em caso de erro
    }
  }

  Modal.setAppElement("#root");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setPhoneNumber("");
    setAddress("");
    setGender("");
    setEmail("");
    setEmployeeId("");
    setType("");
  };

  const closeModalSite = () => {
    setIsSiteModalOpen(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const user = localStorage.getItem("userId");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}userAuth/signUp?roler=3`,
        {
          name,
          email: "exemplo@exemplo.com",
          address: "Luanda",
          gender: "Man",
          phoneNumber,
          password: "12345678",
          employeeId,
          codeEstablishment: "LA",
          admissionDate: "2000-01-01",
          situation: "efectivo",
          departmentCode: "0009999",
          mecCoordinator: user,
        }
      );
      if (response.data.data.status === 201) {
        toast.success("Utilizador cadastrado com sucesso");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      toast.error(
        "Algo correu mal por favor tente novamente, ou consulte um administrador"
      );
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  async function handleEditUser(userId) {
    setIsEditModalOpen(true);
    const data = users.find((user) => userId === user._id);
    setEditedUser(data);
  }

  async function handleSiteUser(employeeId) {
    try {
      setIsSiteModalOpen(true);
      setUserSite([]);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}companySite/getSuperivsorSites/${employeeId}?size=500`
      );
      if (response.data && Array.isArray(response.data.data.data)) {
        setUserSite(response.data.data.data);
      }
    } catch (error) {
      console.error("Erro:", error.message);
    }
  }

  async function updateUser(e) {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}user/updateMe/${editedUser._id}`,
        {
          name: editedUser.name,
          email: "exemplo@exemplo.com",
          address: "Luanda",
          gender: "Man",
          phoneNumber: editedUser.phoneNumber,
        }
      );

      toast.info("Utilizador actualizado com sucesso");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error.message);
    }
  }

  const handleAssignSite = (userId) => {
    setUserToAssignSite(userId);
    setIsAssignSiteModalOpen(true);
  };

  const closeAssignSiteModal = () => {
    setIsAssignSiteModalOpen(false);
    setSelectedSite("");
    setUserToAssignSite(null);
  };

  const handleAssignSiteToUser = async (e) => {
    e.preventDefault();

    try {
      // Buscar o employeeId do utilizador selecionado
      const selectedUser = users.find((user) => user._id === userToAssignSite);
      const employeeId = selectedUser?.employeeId;

      // Buscar o costCenter do site selecionado
      const selectedSiteDetails = sites.find(
        (site) => site._id === selectedSite
      );
      const costCenter = selectedSiteDetails?.costCenter;

      // Verificar se ambos os valores estão disponíveis
      if (!employeeId || !costCenter) {
        toast.error(
          "Erro: Não foi possível encontrar o employeeId ou costCenter."
        );
        return;
      }

      // Chamada à API com employeeId e costCenter
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}companySite/assignSupervisor/${employeeId}/${costCenter}`
      );

      if (response.data) {
        toast.success("Site atribuído com sucesso");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      toast.error("Por favor, tente mais tarde.");
      console.error("Erro ao atribuir site:", error.message);
    }
  };

  const totalPages = Math.ceil(userSite.length / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = userSite.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="container4">
      <h1 style={{ textAlign: "center" }}>VER E ATRIBUIR SITES</h1>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        / <span>Ajustes</span>
        <br></br> <br></br>
        <div className="space">
          <div className="">
            <div style={{ position: "relative", display: "inline-block" }}>
              <input
                type="text"
                className="form-control"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar funcionário"
                style={{ paddingLeft: "3rem" }} // espaço para o ícone
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="20"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "25px",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#0d214f ", // Azul suave
                }}
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.85-3.85zm-5.598 0A5.5 5.5 0 1 1 10.5 5.5a5.5 5.5 0 0 1-4.356 4.844z" />
              </svg>
            </div>
          </div>
        </div>
        <div>
          {isLoading && (
            <div className="text-center mt-4">
              <CircularProgress size={80} thickness={5} />
            </div>
          )}

          {!isLoading && filteredUsers.length > 0 && (
            <>
              <DataGrid
                rows={
                  Array.isArray(filteredUsers)
                    ? filteredUsers.map((user, index) => ({
                        // Remover o slice para mostrar todos os usuários
                        id: index,

                        name: user.name || "",
                        phoneNumber: user.phoneNumber || "",
                        idUser: user._id,
                        employeeId: user.employeeId,
                      }))
                    : []
                }
                columns={[
                  {
                    field: "name",
                    headerName: "Nome",
                    flex: 1,
                  },
                  {
                    field: "phoneNumber",
                    headerName: "Telefone",
                    flex: 1,
                  },
                  {
                    field: "actions",
                    headerName: "Ações",
                    flex: 1,
                    renderCell: (params) => (
                      <div
                        className="central"
                        style={{ display: "flex", gap: "8px" }}
                      >
                        <button
                          className="btn btn-info"
                          onClick={() => handleSiteUser(params.row.employeeId)}
                          title="Ver sites"
                        >
                          <FontAwesomeIcon icon={faBuilding} />
                        </button>

                        <button
                          className="btn btn-success"
                          onClick={() => handleAssignSite(params.row.idUser)}
                          title="Atribuir Site"
                        >
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </button>
                      </div>
                    ),
                  },
                ]}
                checkboxSelection={false}
                disableColumnFilter
                disableColumnMenu
                disableDensitySelector
                disableColumnSelector
                disableSelectionOnClick
                disableVirtualization={false}
                hideFooter={true} // Oculta a paginação
                autoHeight={false}
                style={{ height: "850px" }} // Mantém a altura fixa para permitir scroll
              />
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAssignSiteModalOpen}
        onRequestClose={closeAssignSiteModal}
        contentLabel="Atribuir Site"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            maxWidth: "800px",
            maxHeight: "450px", // Aumentei a altura máxima para acomodar melhor os botões
            padding: "30px",
            borderRadius: "10px",
            overflow: "visible",
          },
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Atribuir Site
        </h2>
        <form onSubmit={handleAssignSiteToUser}>
          <div className="form-group">
            <label
              htmlFor="site"
              style={{
                marginBottom: "10px",
                display: "block",
                fontWeight: "bold",
              }}
            >
              Selecione um site:
            </label>

            <div className="custom-select-container">
              <input
                type="text"
                className="form-control"
                placeholder="Digite para pesquisar um site..."
                value={siteSearchTerm}
                onChange={(e) => setSiteSearchTerm(e.target.value)}
                style={{ marginBottom: "10px" }}
              />

              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  marginBottom: "30px", // Aumentei o espaço após a lista
                }}
              >
                {safeSites
                  .filter((site) => {
                    // Verificar se o site existe
                    if (!site) return false;

                    // Verificar se o termo de pesquisa existe
                    const searchTerm = siteSearchTerm
                      ? siteSearchTerm.toLowerCase()
                      : "";

                    // Verificar name de forma segura
                    const siteName = site.name ? site.name.toLowerCase() : "";

                    // Verificar costCenter de forma segura
                    const siteCostCenter = site.costCenter
                      ? site.costCenter.toLowerCase()
                      : "";

                    // Retornar resultado da pesquisa
                    return (
                      siteName.includes(searchTerm) ||
                      siteCostCenter.includes(searchTerm)
                    );
                  })
                  .map((site) => (
                    <div
                      key={site._id || Math.random().toString()}
                      className={`site-option ${
                        selectedSite === site._id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedSite(site._id)}
                      style={{
                        padding: "10px 15px",
                        cursor: "pointer",
                        backgroundColor:
                          selectedSite === site._id ? "#e6e6ff" : "white",
                        borderBottom: "1px solid #eee",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          selectedSite === site._id ? "#e6e6ff" : "#f8f9fa")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          selectedSite === site._id ? "#e6e6ff" : "white")
                      }
                    >
                      <div style={{ fontWeight: "bold" }}>
                        {site.name || "Sem nome"}
                      </div>
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        Centro de custo: {site.costCenter || "N/A"}
                      </div>
                    </div>
                  ))}

                {safeSites.filter((site) => {
                  if (!site) return false;
                  const searchTerm = siteSearchTerm
                    ? siteSearchTerm.toLowerCase()
                    : "";
                  const siteName = site.name ? site.name.toLowerCase() : "";
                  const siteCostCenter = site.costCenter
                    ? site.costCenter.toLowerCase()
                    : "";
                  return (
                    siteName.includes(searchTerm) ||
                    siteCostCenter.includes(searchTerm)
                  );
                }).length === 0 && (
                  <div
                    style={{
                      padding: "15px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    Nenhum site encontrado
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginTop: "20px", // Aumentei a margem superior
              marginBottom: "20px", // Adicionei margem inferior
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedSite}
              style={{
                width: "auto",
                padding: "8px 15px",
                fontSize: "14px",
              }}
            >
              <FontAwesomeIcon icon={faSave} /> Atribuir
            </button>
            <button
              type="submit"
              className="btn btn-secondary"
              onClick={closeAssignSiteModal}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isSiteModalOpen}
        onRequestClose={closeModalSite}
        style={modalStyles}
        ariaHideApp={false}
      >
        <div style={{ position: "relative" }}>
          <button
            className="btn-close"
            onClick={closeModalSite}
            style={closeButtonStyles}
            aria-label="Fechar"
          >
            &times;
          </button>
          <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Sites</h1>
          <table style={tableContainerStyles}>
            <thead>
              <tr>
                <th style={tableHeaderStyles}>NOME</th>
                <th style={tableHeaderStyles}>Centro de custo</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Nenhum dado disponível
                  </td>
                </tr>
              ) : (
                currentItems.map((site, index) => (
                  <tr key={index} style={tableRowStyles}>
                    <td style={tableCellStyles}>{site.name}</td>
                    <td style={tableCellStyles}>{site.costCenter}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {currentItems.length > 0 && (
            <div style={buttonContainerStyles}>
              <button
                className="btn btn-secondary"
                onClick={handlePreviousPage}
                style={prevButtonStyles}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span style={{ fontSize: "14px" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={handleNextPage}
                style={nextButtonStyles}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Team;
