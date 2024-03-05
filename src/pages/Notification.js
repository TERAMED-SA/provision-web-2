import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import { margin, padding, textAlign } from "@mui/system";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from "../assets/logo.png"
import Pusher from "pusher-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Configuração do Pusher
    const pusher = new Pusher(`${process.env.REACT_APP_KEY}`, {
      cluster: `${process.env.REACT_APP_CLUSTER}`,
      encrypted: true,
    });

    // Subscreva-se ao canal "my-channel"
    const channel = pusher.subscribe("my-channel");

    // Lida com eventos recebidos do canal
    channel.bind("my-event", (data) => {
      console.log("Evento recebido:", data);
    });

    // Retorne uma função de limpeza para remover o listener do Pusher quando o componente for desmontado
    return () => {
      pusher.unsubscribe("my-channel");
    };

  }, []);

  async function fetchNotifications() {
    try {
      setIsLoading(true);
      const user = localStorage.getItem('userId');
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
  async function getSupInfo(id) {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}supervision/getSupByNotification/${id}`)
      return response.data.data
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleViewDetails = (notification) => {

    setSelectedNotification(notification);
    // setModalShow(true);
  };

  const handleApproval = () => {
    // Lógica para aprovar a notificação
    setModalShow(false);
  };

  const handleRejection = () => {
    // Lógica para reprovar a notificação
    setModalShow(false);
  };

  const approve = async (costCenter, idNot) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}supervision/validate/${costCenter}/${idNot}`)
      toast.success("Aprovado com sucesso")
      setTimeout(() => {
        window.location.reload();
      }, 3000)
    } catch (error) {
      toast.error("Por favor tente novamente ou contacte um administrador")
      console.log("Error:", error);
    }
  }

  const generatePDF = async (id, name) => {
    const dados = await getSupInfo(id);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    // Converte a imagem para uma URL de dados (data URL)
    const imageDataUrl = await convertImageToDataURL(logo);

    const data = {
      name: name,
      createdAt: dados.createdAt,
      supervisorCode: dados.supervisorCode,
      workerInformation: dados.workerInformation,
      numberOfWorkers: dados.numberOfWorkers,
      desiredNumber: dados.desiredNumber,
      equipment: dados.equipment,
      taskId: dados.taskId ? dados.taskId : "",
      time: dados.time,
      costCenter: dados.costCenter,
      report: dados.report,
    };

    // Defina o conteúdo do documento PDF
    const documentDefinition = {

      footer: function (currentPage, pageCount) {
        return {
          text: `Gerado pelo sistema - Página ${currentPage} de ${pageCount}`,
          alignment: 'center',
          margin: [0, 20, 0, 0]
        };
      },

      content: [
        { image: imageDataUrl, width: 70, margin: [0, 0, 0, 30], alignment: 'center' },
        { text: 'RELATÓRIO DA SUPERVISÃO', margin: [0, 0, 0, 40], style: 'header', alignment: 'center' },
        { text: 'Identificação', style: 'subheader', alignment: 'center' },
        { text: `Nome: ${data.name}` },
        { text: `Feito em: ${data.createdAt.toLocaleString()}` },
        { text: `Código do Supervisor: ${data.supervisorCode}` },
        { text: `Número Desejado: ${data.desiredNumber}` },
        { text: `Número de Trabalhadores encontrados: ${data.numberOfWorkers}` },
        { text: `Tempo: ${data.time}` },
        { text: `Centro de custo: ${data.costCenter}` },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }] },
        { text: 'Informação dos Trabalhadores', style: 'subheader', alignment: 'center' },
        {
          ul: data.workerInformation.flatMap((worker) => ([
            `Nome: ${worker.name}`,
            `Número de trabalhador: ${worker.employeeNumber}`,
            `Sitação: ${worker.state}`,
            `OBS: ${worker.obs}`,
            { text: '', margin: [0, 0, 0, 10] }
          ]))
        },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }] },
        { text: 'Equipamentos', style: 'subheader', alignment: 'center' },
        {
          ul: data.equipment.flatMap((equipment) => ([
            `Nome: ${equipment.name}`,
            `Número de série: ${equipment.serialNumber}`,
            `Estado: ${equipment.state}`,
            `Centro de custo: ${equipment.costCenter}`,
            `OBS: ${equipment.obs}`,
            { text: '', margin: [0, 0, 0, 10] }
          ])),
        },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }] },
        { text: 'Informação extras da supervisão', style: 'subheader', alignment: 'center' },
        { text: `${data.report}`, alignment: 'center' }

      ],
      styles: {
        header: {
          fontSize: 22,
          bold: false,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      }
    };

    pdfMake.createPdf(documentDefinition).download();
  };

  const convertImageToDataURL = (imagePath) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      fetch(imagePath)
        .then(response => response.blob())
        .then(blob => reader.readAsDataURL(blob))
        .catch(reject);
    });
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
          <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
            <DataGrid
              rows={notifications.map((notification, index) => ({
                id: index,
                _id: notification._id,
                data: notification.createdAt,
                evento: notification.information,
                supervisor: notification.supervisorName,
                costCenter: notification.costCenter,
                cliente: notification.clientCode,
                estado: notification.state ? "Validado" : "Pendente",
                link: notification.actionLocationId,
                siteName: notification.siteName
              }))}
              columns={[
                { field: "data", headerName: "Data", width: 150 },
                { field: "evento", headerName: "Evento", width: 150 },
                { field: "supervisor", headerName: "Supervisor", width: 300 },
                { field: "costCenter", headerName: "Centro de custo", width: 200 },
                { field: "cliente", headerName: "Cliente", width: 100 },
                { field: "estado", headerName: "Estado", width: 100 },
                {
                  field: "link",
                  headerName: "Ação",
                  width: 250,
                  renderCell: (params) => (
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-success btn-sm m-1"
                        onClick={() => approve(params.row.costCenter, params.row._id)}
                      >
                        Aprovar
                      </button>
                      <button
                        className="btn btn-warning btn-sm m-1"
                        onClick={() => generatePDF(params.row._id, params.row.supervisor)}
                      >
                        Gerar PDF
                      </button>
                    </div>
                  ),
                },
              ]}
              pageSize={5}
              autoHeight
            />
            {/* <Modal
              show={modalShow}
              onHide={() => setModalShow(false)}
              size="lg"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Detalhes da Notificação</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h1 style={{ textAlign: "center" }}>{selectedNotification?.evento}</h1>
                <label>Supervisor: {selectedNotification?.supervisor}</label><br />
                <label>Site: {selectedNotification?.siteName}</label><br />
                <label>Cliente: {selectedNotification?.cliente}</label><br />
                <label>Estado: {selectedNotification?.estado}</label>
                <div>
                  <button className="btn btn-primary">Gerar PDF</button>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="success" onClick={handleApproval}>
                  Aprovar
                </Button>
                <Button variant="danger" onClick={handleRejection}>
                  Reprovar
                </Button>
              </Modal.Footer>
            </Modal> */}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default NotificationList;