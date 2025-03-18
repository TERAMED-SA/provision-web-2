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
import { useMemo } from "react";

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
      // const user = localStorage.getItem("userId");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}occurrence?size=1000`
      );
      const formattedNotifications = response.data.data.data.map(
        (notification) => ({
          ...notification,
          createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
        })
      );
      console.log(formattedNotifications);
      setNotifications(formattedNotifications);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setIsLoading(false);
    }
  }

  const handleViewDetails = async (notification) => {
    // Caso queira mesclar os dados, pode combinar o notification original com o retorno da API
    const occorence = await getOcorrenceByIdNot(notification.idNotification);
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
          ? notification.createdAt
          : null;

      const searchDate = selectedDate
        ? format(selectedDate, "dd/MM/yyyy")
        : null;

      return (
        (notification.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.costCenter
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.details
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        (!selectedDate || notificationDate === searchDate)
      );
    })
    .map((notification, index) => ({
      id: index,
      ...notification,
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
  const sortedRows = [...filteredRows]
    .map((row) => {
      let createdAtTimestamp = 0; // Valor padrão para datas inválidas

      if (row.createdAt && isValidDate(row.createdAt)) {
        const [day, month, year] = row.createdAt.split("/");
        createdAtTimestamp = new Date(`${year}-${month}-${day}`).getTime();
      }

      return {
        ...row,
        createdAtTimestamp, // Adiciona o timestamp para ordenação
      };
    })
    .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp); // Ordena em ordem decrescente

  console.log("Dados depois da ordenação:", sortedRows);
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
     
        {isLoading ? (
          <div className="text-center mt-4">
            <CircularProgress size={80} thickness={5} />
          </div>
        ) : filteredRows.length === 0 ? (
          <p>Nenhuma ocorrência encontrada</p>
        ) : (
          <DataGrid
            rows={sortedRows}
            columns={[
              {
                field: "createdAt",
                headerName: "Data",
                width: 150,
                disableColumnSorting: true,
              },
              { field: "details", headerName: "Detalhes", width: 390 },
              { field: "name", headerName: "Site", width: 360 },
              {
                field: "costCenter",
                headerName: "Centro de custo",
                width: 200,
              },
              {
                field: "detalhes",
                headerName: "Detalhes",
                width: 130,
                renderCell: (params) => (
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleViewDetails(params.row)}
                  >
                    Ver Detalhes
                  </Button>
                ),
              },
            ]}
            pageSize={10}
            autoHeight
            disableColumnSorting
            initialState={{
              pagination: {
                paginationModel: { pageSize: 12, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            pagination
            disableSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}

      <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Ocorrência</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="occurrence-details">
            <h4>Informações Gerais</h4>
            <div className="info-grid">
              <p>
                <strong>Local:</strong> {selectedNotification?.name}
              </p>
              <p>
                <strong>Centro de Custo:</strong>{" "}
                {selectedNotification?.costCenter}
              </p>

              <p>
                <strong>Prioridade:</strong>{" "}
                {getPriorityLabel(selectedNotification?.priority)}
              </p>
              <p>
                <strong>Número de Trabalhadores:</strong>{" "}
                {selectedNotification?.numberOfWorkers}
              </p>
              <p>
                <strong>Detalhes:</strong> {selectedNotification?.details}
              </p>
            </div>

            <h4>Informações dos Trabalhadores</h4>
            {selectedNotification?.workerInformation &&
            selectedNotification.workerInformation.length > 0 ? (
              <div className="worker-list">
                {selectedNotification.workerInformation.map((worker, index) => (
                  <div key={index} className="worker-item">
                    <p>
                      <strong>Nome:</strong> {worker.name}
                    </p>
                    <p>
                      <strong>Número:</strong> {worker.employeeNumber}
                    </p>
                    <p>
                      <strong>Estado:</strong> {worker.state}
                    </p>
                    {worker.obs && (
                      <p>
                        <strong>Observações:</strong> {worker.obs}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma informação de trabalhador disponível.</p>
            )}

            <h4>Equipamentos</h4>
            {selectedNotification?.equipment &&
            selectedNotification.equipment.length > 0 ? (
              <div className="equipment-list">
                {selectedNotification.equipment.map((equip, index) => (
                  <div key={index} className="equipment-item">
                    <p>
                      <strong>Nome:</strong> {equip.name}
                    </p>
                    <p>
                      <strong>Número de Série:</strong> {equip.serialNumber}
                    </p>
                    <p>
                      <strong>Estado:</strong> {equip.state}
                    </p>
                    <p>
                      <strong>Centro de Custo:</strong> {equip.costCenter}
                    </p>
                    {equip.obs && (
                      <p>
                        <strong>Observações:</strong> {equip.obs}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum equipamento registrado.</p>
            )}
          </div>
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
