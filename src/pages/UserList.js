import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import Avatar from "react-avatar";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import { Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserList = () => {
  // eslint-disable-next-line no-unused-vars
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
  const [type, setType] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(users.length / usersPerPage);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    try {
      const userCoord = localStorage.getItem("userId");
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user/findBelongsToMe/${userCoord}?size=50`
      );
      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
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

  // eslint-disable-next-line no-unused-vars
  const handleUsersPerPageChange = (e) => {
    const selectedUsersPerPage = parseInt(e.target.value, 10);
    setUsersPerPage(selectedUsersPerPage);
    setPageNumber(0);
  };
  Modal.setAppElement('#root');
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
      const user = localStorage.getItem("userId")
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
          mecCoordinator: user
        }
      );
      if (response.data.data.status === 201) {
        toast.success("Utilizador cadastrado com sucesso");
        setTimeout(() => {
          window.location.reload()
        }, 3000);
      }

    } catch (error) {
      toast.error("Algo correu mal por favor tente novamente, ou consulte um administrador")
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  async function handleEditUser(userId) {
    setIsEditModalOpen(true);
    const data = users.find((user) => userId === user._id);
    setEditedUser(data);
  }

  async function updateUser() {
    try {
      if (!editedUser || !editedUser._id) {
        console.error("Erro ao salvar usuário: Usuário não encontrado.");
        return;
      }

      const data = {
        name: editedUser.name,
        email: editedUser.email,
        address: editedUser.address,
        gender: editedUser.gender,
      };

      // eslint-disable-next-line no-unused-vars
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}user/updateMe/${editedUser._id}`,
        data
      );

      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error.message);
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}user/deleteMe/${userId}`
      );
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error.message);
    }
  };

  return (
    <div className="container4">
      <div className="container-fluid">
        <div className="space">
          <div className=""></div>
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

          {!isLoading && users.length === 0 && (
            <div className="text-center text-black mt-4">
              Nenhum dado disponível
            </div>
          )}

          {!isLoading && users.length > 0 && (
            <>
              <DataGrid
                rows={
                  Array.isArray(users)
                    ? users
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
                        cargo: user.type || "",
                        phoneNumber: user.phoneNumber,
                        idUser: user._id,
                      }))
                    : []
                }
                columns={[
                  {
                    field: "avatar",
                    headerName: "Perfil",
                    width: 80,
                    renderCell: (params) => params.value,
                  },
                  { field: "name", headerName: "Nome", width: 395 },

                  { field: "cargo", headerName: "Cargo", width: 260 },
                  { field: "phoneNumber", headerName: "Telefone", width: 260 },
                  {
                    field: "actions",
                    headerName: "Ações",
                    width: 150,
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
                      </div>
                    ),
                  },
                ]}
                checkboxSelection
                pageSize={usersPerPage}
                pagination
                onPageChange={handlePageChange}
                rowCount={users.length}
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

              <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Adicionar Usuário"
                className="custom-modal"
                style={{
                  overlay: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  },
                  content: {
                    width: '80%',
                    maxWidth: '500px' // Defina o tamanho máximo desejado aqui
                  }
                }}
                overlayClassName="custom-modal-overlay"
              >
                <h2>Cadastrar utilizador</h2>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="name" className="text-modal text-black">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="form-control"
                        placeholder="Nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="email" className="text-modal text-black">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="phone" className="text-modal text-black">
                        Número de Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="form-control"
                        placeholder="Número de Telefone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label
                        htmlFor="address"
                        className="text-modal text-black"
                      >
                        Endereço
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="form-control"
                        placeholder="Endereço"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="phone" className="text-modal text-black">
                        Nª Mec
                      </label>
                      <input
                        type="number"
                        id="mec"
                        className="form-control"
                        placeholder="Digite o número mec"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="gender" className="text-modal text-black">
                        Gênero
                      </label>
                      <select
                        id="gender"
                        className="form-control"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Selecione um género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>
                  </div>


                </div>

                <div className="form-group text-center"> {/* Adicionando a classe "text-center" para alinhar o conteúdo no centro */}
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn btn-success form-control" onClick={handleAddUser}>
                        Adicionar
                      </button>
                    </div>

                    <div className="col-md-6">
                      <button className="btn btn-danger form-control" onClick={closeModal}>
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>

              </Modal>

              <Modal
                isOpen={isEditModalOpen}
                onRequestClose={() => setIsEditModalOpen(false)}
                contentLabel="Editar Usuário"
                className="custom-modal"
                overlayClassName="custom-modal-overlay"
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="name" className="text-modal text-black">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="form-control"
                        placeholder="Nome"
                        value={editedUser?.name || ""}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email" className="text-modal text-black">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Email"
                        value={editedUser.email || ""}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label
                        htmlFor="address"
                        className="text-modal text-black"
                      >
                        Endereço
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="form-control"
                        placeholder="Endereço"
                        value={editedUser.address || ""}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="gender" className="text-modal text-black">
                        Gênero
                      </label>
                      <select
                        id="gender"
                        className="form-control"
                        value={editedUser.gender || ""}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="Male">Masculino</option>
                        <option value="Female">Feminino</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label
                        htmlFor="phoneNumber"
                        className="text-modal text-black"
                      >
                        Número de Telefone
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        className="form-control"
                        placeholder="Número de Telefone"
                        value={editedUser.phoneNumber || ""}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="type" className="text-modal text-black">
                        Cargo
                      </label>
                      <select
                        id="type"
                        className="form-control"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value="Gestor">Gestor</option>
                        <option value="Coordenador">Coordenador</option>
                        <option value="Supervisor">Supervisor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <button className="btn btn-primary" onClick={updateUser}>
                    <FontAwesomeIcon icon={faSave} className="" /> Salvar
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} className=" " /> Fechar
                  </button>
                </div>
              </Modal>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserList;
