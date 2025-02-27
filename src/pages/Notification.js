import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logo from "../assets/logo.png";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [clientCode, setClientCode] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState([]);
  const [siteInfo, setSiteInfo] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const user = localStorage.getItem("userId");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}notification/${user}?size=500`
      );
      const formattedNotifications = response.data.data.map((notification) => ({
        ...notification,
        createdAt: format(new Date(notification.createdAt), "yyyy-MM-dd"),
      }));
      setNotifications(formattedNotifications);
      setFilteredNotifications(formattedNotifications); 
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = notifications.filter(
      (notification) => notification.clientCode === clientCode
    );
    setFilteredNotifications(filtered);
  };

  const clearFilter = () => {
    setFilteredNotifications(notifications);
    setClientCode("");
  };

  const convertImageToDataURL = (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imagePath;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (error) => reject(error);
    });
  };

  const getSupInfo = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}supervision/${id}`
      );
      return response.data.data || {};
    } catch (error) {
      console.error("Error fetching supervision info:", error.message);
      return {};
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
    const formattedDate = formatDate(createdAt);
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
        { text: `Feito em: ${formattedDate}` },
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

  return (
    <div className="container">
      <h1>Relatório Mensal</h1>

      <div className="mb-3 d-flex align-items-center">
        <input
          type="text"
          placeholder="Digite o código do cliente"
          value={clientCode}
          onChange={(e) => setClientCode(e.target.value)}
          className="form-control me-2"
          style={{ maxWidth: "300px" }}
        />
        <Button onClick={handleSearch} className="me-2">
          Buscar
        </Button>
        <Button onClick={clearFilter} variant="secondary">
          Limpar Filtro
        </Button>
      </div>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={filteredNotifications.map((notification, index) => ({
              id: index,
              data: notification.createdAt,
              evento: notification.information,
              cliente: notification.clientCode,
            }))}
            columns={[
              { field: "data", headerName: "Data", width: 150 },
              { field: "evento", headerName: "Evento", width: 200 },
              { field: "cliente", headerName: "Cliente", width: 150 },
            ]}
            pageSize={5}
          />
        </div>
      )}

      <Button onClick={generatePDF} className="mt-3">
        Gerar Relatório Mensal (PDF)
      </Button>

      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Ocorrência</Modal.Title>
        </Modal.Header>
        <Modal.Body>{/* Detalhes da notificação */}</Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setModalShow(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotificationList;
