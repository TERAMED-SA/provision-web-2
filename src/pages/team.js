import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faPlus,
    faSave,
    faTimes,
    faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import Avatar from "react-avatar";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import { Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const [type, setType] = useState("");
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [usersPerPage, setUsersPerPage] = useState(8);
    const [isLoading, setIsLoading] = useState(false);
    const pagesVisited = pageNumber * usersPerPage;
    const pageCount = Math.ceil(users.length / usersPerPage);

    const [isAssignSiteModalOpen, setIsAssignSiteModalOpen] = useState(false);
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState("");
    const [userToAssignSite, setUserToAssignSite] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchSites();
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

    async function fetchSites() {
        try {
            const response = await axios.get(
                "https://provision-07c1.onrender.com/api/v1/companySite?size=500"
            );
            if (response.data && Array.isArray(response.data.data.data)) {
                setSites(response.data.data.data);
            } else {
                console.error("A resposta da API não contém um array de sites.");
            }
        } catch (error) {
            console.error("Erro ao buscar sites:", error.message);
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

    const handleAddUser = async (e) => {
        e.preventDefault();
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

    async function updateUser(e) {
        e.preventDefault();
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

    const handleAssignSite = (userId) => {
        setUserToAssignSite(userId);
        setIsAssignSiteModalOpen(true);
    };

    const closeAssignSiteModal = () => {
        setIsAssignSiteModalOpen(false);
        setSelectedSite("");
        setUserToAssignSite(null);
    };

    const handleAssignSiteToUser = async () => {
        try {
            // Adicione a lógica para atribuir o site ao usuário aqui
            console.log(
                `Atribuindo site ${selectedSite} ao usuário ${userToAssignSite}`
            );
            toast.success("Site atribuído com sucesso");
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            toast.error("Erro ao atribuir site. Por favor, tente novamente.");
            console.error("Erro ao atribuir site:", error.message);
        }
    };

    return (
        <div className="container4">
            <h1 style={{ textAlign: "center" }}>Funcionários</h1>
            <div className="container-fluid">
                <div className="space">
                    <div className=""></div>
                    <div className="">
                        <button className="btn btn-primary mb-3" onClick={openModal}>
                            <FontAwesomeIcon icon={faPlus} /> Adicionar Funcionário
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
                                rows={users.map((user) => ({
                                    id: user._id,
                                    name: user.name,
                                    email: user.email,
                                    phoneNumber: user.phoneNumber,
                                    address: user.address,
                                    gender: user.gender,
                                }))}
                                columns={[
                                    { field: "name", headerName: "Nome", flex: 1 },
                                    { field: "email", headerName: "Email", flex: 1 },
                                    { field: "phoneNumber", headerName: "Telemóvel", flex: 1 },
                                    { field: "address", headerName: "Endereço", flex: 1 },
                                    { field: "gender", headerName: "Gênero", flex: 1 },
                                    {
                                        field: "actions",
                                        headerName: "Ações",
                                        flex: 1,
                                        renderCell: (params) => (
                                            <div>
                                                <button
                                                    className="btn btn-warning btn-sm mr-2"
                                                    onClick={() => handleEditUser(params.row.id)}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm mr-2"
                                                    onClick={() => handleDeleteUser(params.row.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleAssignSite(params.row.id)}
                                                >
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                </button>
                                            </div>
                                        ),
                                    },
                                ]}
                                pageSize={usersPerPage}
                                onPageChange={handlePageChange}
                                paginationMode="server"
                                rowCount={users.length}
                                style={{ height: '580px' }}
                            />


                        </>
                    )}
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Adicionar Funcionário"
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
                        width: "50%",
                    },
                }}
            >
                <h2>Adicionar Funcionário</h2>
                <form onSubmit={handleAddUser}>
                    <div className="form-group">
                        <label htmlFor="name">Nome</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Telemóvel</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Endereço</label>
                        <input
                            type="text"
                            className="form-control"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Gênero</label>
                        <select
                            className="form-control"
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                        >
                            <option value="">Selecione</option>
                            <option value="male">Masculino</option>
                            <option value="female">Feminino</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="employeeId">ID do Funcionário</label>
                        <input
                            type="text"
                            className="form-control"
                            id="employeeId"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Tipo</label>
                        <select
                            className="form-control"
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        >
                            <option value="">Selecione</option>
                            <option value="admin">Administrador</option>
                            <option value="user">Usuário</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <FontAwesomeIcon icon={faSave} /> Salvar
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ml-2"
                        onClick={closeModal}
                    >
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={() => setIsEditModalOpen(false)}
                contentLabel="Editar Funcionário"
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
                        width: "50%",
                    },
                }}
            >
                <h2>Editar Funcionário</h2>
                <form onSubmit={updateUser}>
                    <div className="form-group">
                        <label htmlFor="editName">Nome</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editName"
                            value={editedUser.name}
                            onChange={(e) =>
                                setEditedUser({ ...editedUser, name: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editEmail">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="editEmail"
                            value={editedUser.email}
                            onChange={(e) =>
                                setEditedUser({ ...editedUser, email: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editPhoneNumber">Telemóvel</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="editPhoneNumber"
                            value={editedUser.phoneNumber}
                            onChange={(e) =>
                                setEditedUser({ ...editedUser, phoneNumber: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editAddress">Endereço</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editAddress"
                            value={editedUser.address}
                            onChange={(e) =>
                                setEditedUser({ ...editedUser, address: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editGender">Gênero</label>
                        <select
                            className="form-control"
                            id="editGender"
                            value={editedUser.gender}
                            onChange={(e) =>
                                setEditedUser({ ...editedUser, gender: e.target.value })
                            }
                            required
                        >
                            <option value="">Selecione</option>
                            <option value="male">Masculino</option>
                            <option value="female">Feminino</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <FontAwesomeIcon icon={faSave} /> Salvar
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ml-2"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                </form>
            </Modal>

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
                        width: "50%",
                    },
                }}
            >
                <h2>Atribuir Site</h2>
                <form onSubmit={handleAssignSiteToUser}>
                    <div className="form-group">
                        <label htmlFor="site">Site</label>
                        <select
                            className="form-control"
                            id="site"
                            value={selectedSite}
                            onChange={(e) => setSelectedSite(e.target.value)}
                            required
                        >
                            <option value="">Selecione um site</option>
                            {sites.map((site) => (
                                <option key={site._id} value={site._id}>
                                    {site.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <FontAwesomeIcon icon={faSave} /> Atribuir
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ml-2"
                        onClick={closeAssignSiteModal}
                    >
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                </form>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default Team;