import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import { margin, padding, textAlign } from "@mui/system";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlignCenter } from "react-bootstrap-icons";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [modalInfo, setModalInfo] = useState([]);
  const [companyInfo, setCompanyInfo] = useState([]);
  const [siteInfo, setSiteInfo] = useState([]);

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
      const formattedNotifications = await response.data.data.map(
        (notification) => ({
          ...notification,
          createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
        })
      );
      const supervisionFilter = formattedNotifications.filter(
        (data) => data.information === "Supervisão"
      );
      setNotifications(supervisionFilter);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setIsLoading(false);
    }
  }
  async function getSupInfo(id) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}supervision/getSupByNotification/${id}?size=500`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async function getSiteInfo(costCenter) {
    try {
      const responseCompanySite = await axios.get(
        `${process.env.REACT_APP_API_URL}companySite/${costCenter}`
      );
      return responseCompanySite.data.data;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    // setModalShow(true);
  };
  const getOcorrenceByIdNot = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}occurrence/getOcorByNotification/${id}?size=500`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const openModal = async (info) => {
    const occorence = await getOcorrenceByIdNot(info._id);
    setSelectedNotification(occorence);
    setModalShow(true);
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
  const openVerificationModal = async (id, name, costCenter) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}companySite/getCompanyInfo/${costCenter}`
    );
    const responseCompanySite = await axios.get(
      `${process.env.REACT_APP_API_URL}companySite/${costCenter}`
    );
    localStorage.setItem("supervisionId", id);
    localStorage.setItem("supervisorName", name);
    localStorage.setItem("supervisionCostCenter", costCenter);
    const dados = await getSupInfo(id);
    setSiteInfo(responseCompanySite.data.data);
    setCompanyInfo(response.data.data);
    setModalInfo(dados);
    setVerificationModal(true);
  };
  const closeVerificationModal = () => {
    localStorage.removeItem("supervisionId");
    localStorage.removeItem("supervisorName");
    localStorage.removeItem("supervisionCostCenter");
    setVerificationModal(true);
  };

  const approve = async (costCenter, idNot) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}supervision/validate/${costCenter}/${idNot}`
      );
      toast.success("Aprovado com sucesso");
      localStorage.removeItem("supervisionId");
      localStorage.removeItem("supervisorName");
      localStorage.removeItem("supervisionCostCenter");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error("Por favor tente novamente ou contacte um administrador");
      console.log("Error:", error);
    }
  };

  const generatePDF = async (id, name, costCenter) => {
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
      companyName: companyInfo.name,
      companyClientCode: companyInfo.clientCode,
      siteName: siteInfo.name,
    };

    const createdAt = new Date(data.createdAt);
    const formattedDate = `${createdAt.getFullYear()}-${String(
      createdAt.getMonth() + 1
    ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
    const documentDefinition = {
      footer: function (currentPage, pageCount) {
        return {
          text: `Gerado pelo sistema - Página ${currentPage} de ${pageCount}`,
          alignment: "center",
          margin: [0, 20, 0, 0],
        };
      },

      content: [
        {
          image: imageDataUrl,
          width: 70,
          margin: [0, 0, 0, 20],
          alignment: "center",
        },
        {
          text: "RELATÓRIO DA SUPERVISÃO",
          margin: [0, 0, 0, 20],
          style: "header",
          alignment: "center",
        },
        {
          text: "Identificação",
          size: 40,
          style: "subheader",
          alignment: "center",
        },
        { text: "Informação do Supervisor", bold: 900, margin: [10, 10, 0, 5] },
        { text: `Nome: ${data.name}` },
        { text: `Código do Supervisor: ${data.supervisorCode}` },
        { text: `Tempo da supervisão: ${data.time}` },
        { text: `Feito em: ${data.createdAt.toLocaleString()}` },
        { text: "" },
        { text: "Informação do Site", bold: 1000, margin: [20, 10, 0, 5] },
        { text: `Nome do site: ${data.siteName}` },
        { text: `Centro de custo: ${data.costCenter}` },
        { text: `Nome da empresa: ${data.companyName}` },
        { text: `Código de empresa: ${data.companyClientCode}` },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 595 - 2 * 40,
              y2: 5,
              lineWidth: 1,
            },
          ],
        },
        {
          text: "Informação dos Trabalhadores",
          style: "subheader",
          alignment: "center",
          margin: [0, 10, 0, 10],
        },
        { text: `Numero de trabalhadores pretendido: ${data.desiredNumber}` },

        { text: `Presentes: ${data.numberOfWorkers}` },
        { text: `Faltou:  ${data.workerInformation.length}` },
        { text: "Lista dos trabalhadores ausentes:", margin: [0, 0, 0, 10] },
        {
          ul: data.workerInformation.flatMap((worker) => [
            { text: `Nome: ${worker.name}`, margin: [30, 0, 0, 0] }, // Adicionando margem à esquerda
            {
              text: `Número de trabalhador: ${worker.employeeNumber}`,
              margin: [30, 0, 0, 0],
            },
            { text: `Situação: ${worker.state}`, margin: [30, 0, 0, 0] },
            { text: `OBS: ${worker.obs}`, margin: [30, 0, 0, 10] }, // Margem maior na parte inferior
          ]),
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 595 - 2 * 40,
              y2: 5,
              lineWidth: 1,
            },
          ],
        },
        { text: "Equipamentos", style: "subheader", alignment: "center" },
        {
          text: `Quantidade de equipamentos encontrado: ${data.equipment.length}`,
        },
        {
          text: `Lista dos equipamentos encontrados:  `,
          margin: [0, 0, 0, 10],
        },
        {
          ul: data.equipment.flatMap((equipment) => [
            { text: `Nome: ${equipment.name}`, margin: [30, 0, 0, 0] }, // Adicionando margem à esquerda
            {
              text: `Número de série: ${equipment.serialNumber}`,
              margin: [30, 0, 0, 0],
            },
            { text: `Estado: ${equipment.state}`, margin: [30, 0, 0, 0] },
            {
              text: `Centro de custo: ${equipment.costCenter}`,
              margin: [30, 0, 0, 0],
            },
            { text: `OBS: ${equipment.obs}`, margin: [30, 0, 0, 10] }, // Margem maior na parte inferior
          ]),
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 595 - 2 * 40,
              y2: 5,
              lineWidth: 1,
            },
          ],
        },
        {
          text: "Informação extras da supervisão",
          style: "subheader",
          alignment: "center",
        },
        { text: `${data.report}` },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: false,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },
    };
    pdfMake
      .createPdf(documentDefinition)
      .download(`relatório_supervião_${formattedDate}.pdf`);
  };

  const convertImageToDataURL = (imagePath) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      fetch(imagePath)
        .then((response) => response.blob())
        .then((blob) => reader.readAsDataURL(blob))
        .catch(reject);
    });
  };
  return (
    <div className="container">
      <div className="container-fluid">
        <h1>Supervisão</h1>
        {isLoading ? (
          <div className="text-center mt-4">
            <CircularProgress size={80} thickness={5} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-black mt-4">
            Nenhuma notificação disponível
          </div>
        ) : (
          <div style={{ overflow: "auto", maxHeight: "70vh" }}>
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
                      {params.row.evento === "Supervisão" && (
                        <button
                          className="btn btn-warning btn-sm m-1"
                          onClick={() =>
                            openVerificationModal(
                              params.row._id,
                              params.row.supervisor,
                              params.row.costCenter
                            )
                          }
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
              show={verificationModal}
              onHide={() => setVerificationModal(false)}
              size="xl"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>RELATÓRIO DA SUPERVISÃO</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h1 style={{ textAlign: "center" }}>
                  {selectedNotification?.evento}
                </h1>
                <div style={{ fontSize: "20px" }}>
                  <h1 style={{ textAlign: "center" }}>IDENTIFICAÇÃO</h1>
                  <h3 style={{ marginLeft: "20px" }}>
                    Informação do Supervisor
                  </h3>
                  <p>Nome: {localStorage.getItem("supervisorName")}</p>
                  <p>Código do supervisor: {modalInfo.supervisorCode}</p>
                  <p>Tempo da supersão: {modalInfo.time}</p>
                  <p>Feito em: {modalInfo.createdAt} </p>

                  <h3 style={{ marginLeft: "20px" }}>Informação do site</h3>
                  <p>Nome: {siteInfo.name}</p>
                  <p>Centro de custo: {modalInfo.costCenter}</p>
                  <p>Nome da empresa: {companyInfo.name}</p>
                  <p>Código de cliente: {companyInfo.clientCode}</p>
                  <hr />
                  <h1 style={{ textAlign: "center" }}>
                    Informação dos trabalhadores
                  </h1>
                  <p>Numero de trabalhadores pretendido: 0</p>
                  <p>Presentes: {modalInfo.numberOfWorkers}</p>
                  <p>
                    Ausentes:{" "}
                    {modalInfo.workerInformation &&
                      modalInfo.workerInformation.length}
                  </p>
                  <p>Lista dos trabalhadores ausentes:</p>
                  <ul>
                    {modalInfo &&
                      modalInfo.workerInformation &&
                      modalInfo.workerInformation.map((item, index) => (
                        <li key={index}>
                          <div>
                            <p>Nome: {item.name}</p>
                            <p>ID trabalhador: {item.employeeNumber}</p>
                            <p>Situação: {item.state}</p>
                            <p>Observação: {item.obs}</p>
                          </div>
                        </li>
                      ))}
                  </ul>
                  <hr />
                  <h1 style={{ textAlign: "center" }}>
                    Informação dos equipamentos
                  </h1>
                  <p>
                    Quantidade de equipamentos encontrado:{" "}
                    {modalInfo.equipment && modalInfo.equipment.length}
                  </p>
                  <p>Lista dos equipamentos encontrados: </p>
                  <ul>
                    {modalInfo &&
                      modalInfo.equipment &&
                      modalInfo.equipment.map((item, index) => (
                        <li key={index}>
                          <div>
                            <p>Nome: {item.name}</p>
                            <p>Número de série: {item.serialNumber}</p>
                            <p>Centro de custi {item.costCenter}</p>
                            <p>Estado: {item.state}</p>
                            <p>Observação: {item.obs}</p>
                          </div>
                        </li>
                      ))}
                  </ul>

                  <hr />
                  <h1 style={{ textAlign: "center" }}>
                    Informação extra da supervisão
                  </h1>
                  <p>{modalInfo.report}</p>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="success"
                  onClick={() =>
                    approve(
                      localStorage.getItem("supervisionCostCenter"),
                      localStorage.getItem("supervisionId")
                    )
                  }
                >
                  Aprovar
                </Button>
                <Button
                  onClick={() =>
                    generatePDF(
                      localStorage.getItem("supervisionId"),
                      localStorage.getItem("supervisorName"),
                      localStorage.getItem("supervisionCostCenter")
                    )
                  }
                  variant="info"
                >
                  Gerar PDF
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default NotificationList;
