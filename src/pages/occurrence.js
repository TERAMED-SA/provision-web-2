import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logo from "../assets/logo.png";

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [searchInput, setSearchInput] = useState("Ocorrência"); // Inicializando com "Supervisão"
    const [inputVisible, setInputVisible] = useState(false); // Inicializando como falso

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            setIsLoading(true);
            const user = localStorage.getItem("userId");
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}notification/${user}?size=500`
            );
            const formattedNotifications = response.data.data.map((notification) => ({
                ...notification,
                createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
            }));
            setNotifications(formattedNotifications);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error.message);
            setIsLoading(false);
        }
    }

    const handleViewDetails = async (notification) => {
        setSelectedNotification(notification);
        const occorence = await getOcorrenceByIdNot(notification._id);
        setSelectedNotification(occorence);
        setModalShow(true);
    };

    async function getOcorrenceByIdNot(id) {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}occurrence/getOcorByNotification/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const filteredNotifications = notifications.filter(
        (notification) =>
            notification.createdAt
                .toLowerCase()
                .includes(searchInput.toLowerCase()) ||
            notification.supervisorName
                .toLowerCase()
                .includes(searchInput.toLowerCase()) ||
            notification.costCenter
                .toLowerCase()
                .includes(searchInput.toLowerCase()) ||
            notification.clientCode.toLowerCase().includes(searchInput.toLowerCase()) ||
            notification.information.toLowerCase().includes(searchInput.toLowerCase()) // Pesquisa por nome do evento
    );

    const approve = async (costCenter, idNot) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}supervision/validate/${costCenter}/${idNot}`
            );
            toast.success("Aprovado com sucesso");
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            toast.error("Por favor tente novamente ou contacte um administrador");
            console.log("Error:", error);
        }
    };

    const generatePDF = async (id, name) => {
        // Lógica para gerar PDF
    };

    const handleApproval = () => {
        toast.warning(
            "Ainda não foi realizado o tratamento adequado desta informação."
        );
    };

    const handleRejection = () => {
        // Lógica para reprovar a notificação
        setModalShow(false);
    };

    return (   
    <div className="container4 mr-2" style={{ height: "89vh" }}>
         <h1 style={{ textAlign: "center" }}>
         OCORRÊNCIAS <span className="badge badge-secondary"></span>
        </h1>
            <div className="container-fluid"><Link to="/Home" className="p-1">Início </Link> / <span>Ocorrências</span>
            <br></br> <br></br> 
        <div className="container">
            <div className="space">
                <div className=""></div>
                <div className="">
                    {inputVisible && ( // Renderiza o input apenas se inputVisible for true
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Pesquisar"
                                value={searchInput}
                                onChange={handleSearchInputChange}
                            />
                        </div>
                    )}
                </div>
            </div>
         
            
               
                {isLoading ? (
                    <div className="text-center mt-4">
                        <CircularProgress size={80} thickness={5} />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center text-black mt-4">
                        Nenhuma notificação Encontrada
                    </div>
                ) : (
                    <div style={{ overflow: "auto", maxHeight: "70vh" }}>
                        <DataGrid
                            rows={filteredNotifications
                                .slice()
                                .reverse()
                                .map((notification, index) => ({
                                    id: index,
                                    _id: notification._id,
                                    data: notification.createdAt,
                                    evento: notification.information,
                                    supervisor: notification.supervisorName,
                                    costCenter: notification.costCenter,
                                    cliente: notification.clientCode,
                                    estado: notification.state ? "Validado" : "Pendente",
                                    link: notification.actionLocationId,
                                    siteName: notification.siteName,
                                }))}
                            columns={[
                                { field: "data", headerName: "Data", width: 150 },
                                { field: "evento", headerName: "Evento", width: 150 },
                                { field: "supervisor", headerName: "Supervisor", width: 300 },
                                {
                                    field: "costCenter",
                                    headerName: "Centro de custo",
                                    width: 200,
                                },
                                { field: "cliente", headerName: "Cliente", width: 100 },
                                { field: "estado", headerName: "Estado", width: 100 },
                                {
                                    field: "link",
                                    headerName: "Ação",
                                    width: 250,
                                    renderCell: (params) => (
                                        <div className="d-flex justify-content-center">
                                            {params.row.evento !== "Ocorrência" && (
                                                <button
                                                    className="btn btn-success btn-sm m-1"
                                                    onClick={() =>
                                                        approve(params.row.costCenter, params.row._id)
                                                    }
                                                >
                                                    Aprovar
                                                </button>
                                            )}
                                            {params.row.evento === "Supervisão" && (
                                                <button
                                                    className="btn btn-warning btn-sm m-1"
                                                    onClick={() =>
                                                        generatePDF(params.row._id, params.row.supervisor)
                                                    }
                                                >
                                                    Gerar PDF
                                                </button>
                                            )}
                                            {params.row.evento === "Ocorrência" && (
                                                <button
                                                    className="btn btn-info btn-sm m-1"
                                                    onClick={() => handleViewDetails(params.row)}
                                                >
                                                    Detalhes
                                                </button>
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                            pageSize={5}
                            autoHeight
                        />

                        <Modal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                            size="lg"
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Detalhes da Ocorrência</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <h1 style={{ textAlign: "center" }}>
                                    {selectedNotification?.evento}
                                </h1>
                                <div style={{ fontSize: "30px" }}>
                                    <label>Assunto: {selectedNotification?.name}</label>
                                    <br />
                                    <label>
                                        Centro de custo: {selectedNotification?.costCenter}
                                    </label>
                                    <br />
                                    <label>
                                        Prioridade:{" "}
                                        {selectedNotification?.priority === 0
                                            ? "Máxima"
                                            : selectedNotification?.priority === 1
                                                ? "Mínima"
                                                : "Baixa"}
                                    </label>
                                    <br />
                                    <p>Detalhes: {selectedNotification?.details}</p>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="success" onClick={handleApproval}>
                                    Aprovar
                                </Button>
                                <Button variant="danger" onClick={handleRejection}>
                                    Fechar
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
        </div>
    );
};

export default NotificationList;