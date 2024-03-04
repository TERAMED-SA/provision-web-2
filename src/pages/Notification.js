import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}notification/11835?size=500`
      );
      setNotifications(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setIsLoading(false);
    }
  }

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setModalShow(true);
  };

  const handleApproval = () => {
    // Lógica para aprovar a notificação
    setModalShow(false);
  };

  const handleRejection = () => {
    // Lógica para reprovar a notificação
    setModalShow(false);
  };

  return (
    <div className="container">
      <div className="container-fluid">
        <h1>Notificações</h1>
        {isLoading ? (
          <div className="text-center mt-4">
            <CircularProgress size={80} thickness={5} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-black mt-4">
            Nenhuma notificação disponível
          </div>
        ) : (
          <div>
            <DataGrid
              rows={notifications.map((notification, index) => ({
                id: index,
                evento: notification.information,
                supervisor: notification.supervisor,
                site: notification.site,
                cliente: notification.cliente,
                estado: notification.state ? "Validado" : "Pendente",
                link: notification.actionLocationId,
              }))}
              columns={[
                { field: "evento", headerName: "Evento", width: 400 },
                { field: "supervisor", headerName: "Supervisor", width: 200 },
                { field: "site", headerName: "Site", width: 200 },
                { field: "cliente", headerName: "Cliente", width: 200 },
                { field: "estado", headerName: "Estado", width: 150 },
                {
                  field: "link",
                  headerName: "Ação",
                  width: 150,
                  renderCell: (params) => (
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-success btn-sm m-1"
                        onClick={() => handleViewDetails(params.row)}
                      >
                        Abrir
                      </button>
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
                <Modal.Title>Detalhes da Notificação</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h5>EVENTO: {selectedNotification?.evento}</h5>
                <p>Supervisor: {selectedNotification?.supervisor}</p>
                <p>Site: {selectedNotification?.site}</p>
                <p>Cliente: {selectedNotification?.cliente}</p>
                <p>Estado: {selectedNotification?.estado}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="success" onClick={handleApproval}>
                  Aprovar
                </Button>
                <Button variant="danger" onClick={handleRejection}>
                  Reprovar
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
