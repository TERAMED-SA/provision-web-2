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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

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
      console.error("Erro:", error);
    }
  }

  // Função para validar se uma string é uma data válida no formato "dd/MM/yyyy"
  const isValidDate = (dateString) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateString)) return false;

    const parts = dateString.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    );
  };

  // Filtro principal
  const filteredRows = notifications
    .filter((notification) => {
      const notificationDate =
        notification.createdAt && isValidDate(notification.createdAt)
          ? notification.createdAt // Já está no formato "dd/MM/yyyy"
          : null;

      const searchDate = selectedDate
        ? format(selectedDate, "dd/MM/yyyy") // Converte selectedDate para "dd/MM/yyyy"
        : null;

      return (
        notification.information === "Ocorrência" && // Filtra apenas eventos de tipo "Ocorrência"
        (notification.supervisorName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          notification.costCenter
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.clientCode
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.information
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        (!selectedDate || notificationDate === searchDate) // Filtro por data
      );
    })
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
    }));

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
    setModalShow(false);
  };

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <h1 style={{ textAlign: "center" }}>
        OCORRÊNCIAS<span className="badge badge-secondary"></span>
      </h1>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        / <span>Supervisão</span>
        <br></br> <br></br>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginRight: "10px",
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "3rem" }}
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
                color: "#0d214f ",
              }}
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.85-3.85zm-5.598 0A5.5 5.5 0 1 1 10.5 5.5a5.5 5.5 0 0 1-4.356 4.844z" />
            </svg>
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Filtrar por data"
            className="form-control"
            isClearable
          />
        </div>
        <div className="mt-3">
          <strong>Número total de ocorrências encontradas:</strong>{" "}
          {filteredRows.length}
        </div>
      </div>
      <div className="container">
        {isLoading ? (
          <CircularProgress />
        ) : filteredRows.length === 0 ? (
          <p>Nenhuma ocorrência encontrada</p>
        ) : (
          <DataGrid
            rows={filteredRows}
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
                  <>
                    {params.row.evento !== "Ocorrência" && (
                      <Button
                        onClick={() =>
                          approve(params.row.costCenter, params.row._id)
                        }
                      >
                        Aprovar
                      </Button>
                    )}
                    {params.row.evento === "Supervisão" && (
                      <Button
                        onClick={() =>
                          generatePDF(params.row._id, params.row.supervisor)
                        }
                      >
                        Gerar PDF
                      </Button>
                    )}
                    {params.row.evento === "Ocorrência" && (
                      <Button onClick={() => handleViewDetails(params.row)}>
                        Mais Informações
                      </Button>
                    )}
                  </>
                ),
              },
            ]}
            pageSize={10}
            autoHeight
          />
        )}
      </div>
      <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Ocorrência</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Ocorrência: {selectedNotification?.name}</p>
          <p>Prioridade: {getPriorityLabel(selectedNotification?.priority)}</p>
          <p>Detalhes: {selectedNotification?.details}</p>
          <h4>Informações do Trabalhador:</h4>
          {selectedNotification?.workerInformation &&
          selectedNotification.workerInformation.length > 0 ? (
            selectedNotification.workerInformation.map((worker, index) => (
              <div key={index}>
                <p>
                  {worker.nome} {worker.mec}
                </p>
              </div>
            ))
          ) : (
            <p>Nenhuma informação de trabalhador disponível.</p>
          )}
          <h4>Equipamentos:</h4>
          {selectedNotification?.equipment &&
          selectedNotification.equipment.length > 0 ? (
            selectedNotification.equipment.map((equip, index) => (
              <div key={index}>
                <p>
                  {equip.name} {equip.serialNumber}
                </p>
              </div>
            ))
          ) : (
            <p>Nenhum equipamento mencionado.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  function getPriorityLabel(priority) {
    switch (priority) {
      case 0:
        return "Máxima";
      case 1:
        return "Mínima";
      default:
        return "Baixa";
    }
  }
};

export default NotificationList;
