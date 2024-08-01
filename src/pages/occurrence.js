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

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [searchInput, setSearchInput] = useState(""); // Inicializando com "Supervisão"
  const [inputVisible, setInputVisible] = useState(false); // Inicializando como falso
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filtro para mostrar apenas eventos de tipo "Ocorrência"
  const filteredNotifications = notifications
    .filter((notification) => notification.information === "Ocorrência") // Filtra para mostrar apenas eventos de tipo "Ocorrência"
    .filter(
      (notification) =>
        notification.createdAt
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.supervisorName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.costCenter
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.clientCode
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.information
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
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
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        / <span>Ocorrências</span>
        <br />
        <br />
        <div style={{ position: "relative", display: "inline-block" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              Nenhuma ocorrência encontrada
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
                    clienteName: notification.siteName,
                    estado: notification.state ? "Validado" : "Pendente",
                    link: notification.actionLocationId,
                    siteName: notification.siteName,
                  }))}
                columns={[
                  { field: "data", headerName: "Data", width: 150 },
                  { field: "evento", headerName: "Evento", width: 150 },
                  { field: "supervisor", headerName: "Supervisor", width: 300 },
                  {
                    field: "clienteName",
                    headerName: "Centro de custo",
                    width: 200,
                  },
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
                            className="btn btn-primary btn-sm m-1"
                            onClick={() => handleViewDetails(params.row)}
                          >
                            Mais Informações
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
                pageSize={10}
              />
            </div>
          )}

          <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Detalhes da Ocorrência</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div>
                <h5>Ocorrência:</h5>
                <p>{selectedNotification?.name}</p>

                <h5>Prioridade:</h5>
                <p>
                  {selectedNotification?.priority === 0
                    ? "Máxima"
                    : selectedNotification?.priority === 1
                    ? "Mínima"
                    : "Baixa"}
                </p>
                <h5>Detalhes:</h5>
                <p>{selectedNotification?.details}</p>
                {/* 
<h5>Informações do Trabalhador:</h5>
{selectedNotification?.workerInformation &&
  selectedNotification.workerInformation.length > 0 ? (
  
  <ul>
    {selectedNotification.workerInformation.map(
      (worker, index) => (
        <li key={index}>
          {worker.nome} {worker.mec}
        </li>
      )
    )}
  </ul>
) : (
  <p>Nenhuma informação de trabalhador disponível.</p>
)}
*/}

                <h5>Equipamentos:</h5>
                {selectedNotification?.equipment &&
                selectedNotification.equipment.length > 0 ? (
                  <ul>
                    {selectedNotification.equipment.map((equip, index) => (
                      <li key={index}>
                        {equip.name} {equip.serialNumber}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhum equipamento Mencionado.</p>
                )}
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
        <ToastContainer />
      </div>
    </div>
  );
};

export default NotificationList;
