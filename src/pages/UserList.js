import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faSave,
  faTimes,
  faBuilding
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import Avatar from "react-avatar";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import { Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { textAlign } from "@mui/system";

const UserList = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isSiteModalOpen, setIsSiteModalOpen] = useState("");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [type, setType] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Novo estado para o termo de pesquisa
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);

  const [userSite, setUserSite] = useState([]);


  // Estilos para a modal e colunas
  const modalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)', // Fundo escuro semitransparente
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '50%', // Largura da modal
      backgroundColor: '#fff', // Fundo mais escuro para a modal
      color: '#000', // Texto branco
      border: 'none', // Remove a borda padrão
      borderRadius: '8px', // Adiciona bordas arredondadas
      padding: '20px', // Espaçamento interno
    },
  };

  const columnStyles = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  };

  const columnItemStyles = {
    flex: 1,
    margin: '0 10px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    textAlign: 'center',
  };

  const closeModalSite = () => {
    setIsSiteModalOpen(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  async function fetchUsers() {
    try {
      const userCoord = localStorage.getItem("userId");
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user/findBelongsToMe/${userCoord}?size=50`
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

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleUsersPerPageChange = (e) => {
    const selectedUsersPerPage = parseInt(e.target.value, 10);
    setUsersPerPage(selectedUsersPerPage);
    setPageNumber(0);
  };

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

  const handleAddUser = async () => {
    try {
      const user = localStorage.getItem("userId");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}userAuth/signUp?roler=3`,
        {
          name,
          email,
          address,
          gender,
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
      toast.error(error.response.data.data.message);
    }
  };

  async function handleEditUser(userId) {
    setIsEditModalOpen(true);
    const data = users.find((user) => userId === user._id);
    setEditedUser(data);
  }
  async function handleSiteUser(userId) {
    try {
      //setIsLoading(true);
      setIsSiteModalOpen(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}companySite/getSuperivsorSites/${userId}?size=500`
      );
      if (response.data && Array.isArray(response.data.data.data)) {
        setUserSite(response.data.data.data);
        // setFilteredUsers(response.data.data.data);
      }
      //setIsLoading(false);
    } catch (error) {
      console.error("Erro:", error.message);
      // setIsLoading(false);
    }
  }

  async function updateUser() {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}user/updateMe/${editedUser._id}`,
        {
          name: editedUser.name,
          email: editedUser.email,
          address: editedUser.address,
          gender: editedUser.gender,
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

  const handleDeleteUser = async (userId) => {
    try {
      toast.warning("Nao podes eliminar um utilizador de momento.");
    } catch (error) {
      console.error("Erro ao excluir usuário:", error.message);
    }
  };

  const ITEMS_PER_PAGE = 5; // Defina quantos itens você quer mostrar por página

  const [currentPage, setCurrentPage] = useState(1);

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
      <h1 style={{ textAlign: "center" }}>UTILIZADORES</h1>
      <div className="container-fluid">  <Link to="/Home" className="p-1">Início </Link> / <span>Utilizadores</span>
        <br></br> <br></br>
        <div className="space">

          <div className="">
            <input
              type="text"
              placeholder="Pesquisar usuários"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control mb-3"
            />
          </div>
          <div className="">
            <button className="btn btn-primary mb-3" onClick={openModal}>
              <FontAwesomeIcon icon={faPlus} /> Adicionar Usuário
            </button>
          </div>
        </div>
        <div>
          {isLoading && (
            <div className="text-center mt-4">
              <CircularProgress size={80} thickness={5} />
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center text-black mt-4">
              Nenhum dado disponível
            </div>
          )}

          {!isLoading && filteredUsers.length > 0 && (
            <>
              <DataGrid
                rows={
                  Array.isArray(filteredUsers)
                    ? filteredUsers
                      .slice(pagesVisited, pagesVisited + usersPerPage)
                      .map((user, index) => ({
                        id: index,
                        avatar: (
                          <Avatar
                            name={`${user.name}`}
                            size="40"
                            round={true}
                          />
                        ),
                        name: user.name || "",
                        phoneNumber: user.phoneNumber || "",
                        idUser: user._id,
                        employeeId: user.employeeId
                      }))
                    : []
                }
                columns={[
                  {
                    field: "avatar",
                    headerName: "Perfil",
                    width: 100,
                    headerAlign: 'center',
                    renderCell: (params) => params.value,
                  },
                  { field: "name", headerName: "Nome", width: 395, headerAlign: 'center', },
                  { field: "phoneNumber", headerName: "Telefone", width: 260, headerAlign: 'center' },
                  {
                    field: "actions",
                    headerName: "Ações",
                    width: 200,
                    headerAlign: 'center',
                    cellClassName: 'central',
                    renderCell: (params) => (
                      <div className="central mb-3">
                        <button
                          className="btn btn-primary "
                          onClick={() => handleEditUser(params.row.idUser)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(params.row.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <button
                          className="btn btn-info"
                          onClick={() => handleSiteUser(params.row.employeeId)}
                        >
                          <FontAwesomeIcon icon={faBuilding} />
                        </button>
                      </div>
                    ),
                  },
                ]}
                checkboxSelection
                pageSize={usersPerPage}
                pagination
                onPageChange={handlePageChange}
                rowCount={filteredUsers.length}
                pageCount={pageCount}
              />
              <Pagination>
                <Pagination.Prev
                  onClick={() => handlePageChange({ selected: pageNumber - 1 })}
                  disabled={pageNumber === 0}
                />
                {Array.from({ length: pageCount }).map((_, index) => (
                  <Pagination.Item
                    key={index}
                    active={index === pageNumber}
                    onClick={() => handlePageChange({ selected: index })}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange({ selected: pageNumber + 1 })}
                  disabled={pageNumber === pageCount - 1}
                />
              </Pagination>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>Adicionar Utilizador</h2>
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Telefone:</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Endereço:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Gênero:</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Selecione o gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Employee ID:</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <FontAwesomeIcon icon={faSave} /> Salvar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancelar
          </button>
        </form>
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>Editar Utilizador</h2>
        <form onSubmit={updateUser}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              value={editedUser.name}
              onChange={(e) =>
                setEditedUser({ ...editedUser, name: e.target.value })
              }
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) =>
                setEditedUser({ ...editedUser, email: e.target.value })
              }
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Telefone:</label>
            <input
              type="text"
              value={editedUser.phoneNumber}
              onChange={(e) =>
                setEditedUser({ ...editedUser, phoneNumber: e.target.value })
              }
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Endereço:</label>
            <input
              type="text"
              value={editedUser.address}
              onChange={(e) =>
                setEditedUser({ ...editedUser, address: e.target.value })
              }
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Gênero:</label>
            <select
              value={editedUser.gender}
              onChange={(e) =>
                setEditedUser({ ...editedUser, gender: e.target.value })
              }
              className="form-control"
              required
            >
              <option value="">Selecione o gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            <FontAwesomeIcon icon={faSave} /> Salvar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditModalOpen(false)}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancelar
          </button>
        </form>
      </Modal>
      <Modal
        isOpen={isSiteModalOpen}
        onRequestClose={closeModalSite}
        style={modalStyles}
        ariaHideApp={false}
      >
        <h1 style={{ textAlign: 'center' }}>Meus sites</h1>
        <div style={columnStyles}>
          <div style={columnItemStyles}>
            <h2>NOME</h2>
            {currentItems.map((site, index) => (
              <p key={index}>{site.name}</p>
            ))}
          </div>
          <div style={columnItemStyles}>
            <h2>Centro de custo</h2>
            {currentItems.map((site, index) => (
              <p key={index}>{site.costCenter}</p>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={handlePreviousPage}
            style={{ padding: '10px 20px', fontSize: '14px' }}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            className="btn btn-secondary"
            onClick={handleNextPage}
            style={{ padding: '10px 20px', fontSize: '14px' }}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            className="btn btn-danger"
            onClick={closeModalSite}
            style={{ padding: '15px 30px', fontSize: '16px' }}
          >
            Fechar
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default UserList;
