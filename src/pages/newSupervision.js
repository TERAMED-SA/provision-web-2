import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";
import { Modal, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logo from "../assets/logo.png";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSupervisor, setSearchSupervisor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fonts = {
    Roboto: {
      normal:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
      bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
      italics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
      bolditalics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
    },
  };

  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.fonts = fonts;

  const [verificationModal, setVerificationModal] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    fetchSupervisions();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      fetchMetrics();
    }
  }, [notifications]);

  async function fetchSupervisions() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}supervision?size=1000`
      );

      const formattedNotifications = response.data.data.data.map(
        (supervision) => ({
          id: supervision._id,
          ...supervision,
          createdAt: format(new Date(supervision.createdAt), "dd/MM/yyyy"),
          createdAtDate: new Date(supervision.createdAt),
          createdAtTime: format(new Date(supervision.createdAt), "HH:mm"),
          supervisorName: supervision.supervisorName || "Carregando...",
          siteName: supervision.siteName || "Carregando...",
        })
      );
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error fetching supervisions:", error.message);
    } finally {
      setIsLoading(false);
    }
  }
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

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/metrics?size=950&page=1`
      );
      setMetricsData(response.data.data.sites);
      updateNotificationsWithMetrics(response.data.data.sites);
      console.log(response.data.data.sites.map((site) => site.siteName));
    } catch (error) {
      console.error("Error fetching metrics:", error.message);
    }
  };

  const updateNotificationsWithMetrics = (metrics) => {
    const updatedNotifications = notifications.map((notification) => {
      const metricSite = metrics.find(
        (site) => site.siteCostcenter === notification.costCenter
      );
      if (metricSite) {
        const supervisor =
          metricSite.supervisor &&
          metricSite.supervisor.employeeId === notification.supervisorCode
            ? metricSite.supervisor.name
            : "Não encontrado";
        return {
          ...notification,
          supervisorName: supervisor || "Sem supervisor",
          siteName: metricSite.siteName || "Sem site",
          equipment: notification.equipment || [],
        };
      }
      return notification;
    });
    setNotifications(updatedNotifications);
  };

  const filteredNotifications = notifications.filter(
    (notification) =>
      (searchSupervisor === "" ||
        notification.supervisorName
          .toLowerCase()
          .includes(searchSupervisor.toLowerCase())) &&
      (startDate === "" || notification.createdAtDate >= new Date(startDate)) &&
      (endDate === "" || notification.createdAtDate <= new Date(endDate))
  );

  const openModal = (info) => {
    setModalInfo(info);
    setVerificationModal(true);
  };

  const generatePDF = async (id, supervisorName, costCenter) => {
    const createdAt = new Date(modalInfo.createdAt);
    const formattedDate = modalInfo.createdAt; // Since it's already formatted as dd/MM/yyyy in your data
    const imageDataUrl = await convertImageToDataURL(logo);

    const getBase64ImageFromURL = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute("crossOrigin", "anonymous");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
      });
    };

    const logoBase64 = await getBase64ImageFromURL(logo);
    const documentDefinition = {
      pageMargins: [40, 100, 40, 60], // Ajuste as margens para dar espaço para a logo
      header: {
        image: logoBase64,
        width: 100, // Ajuste o tamanho da logo conforme necessário
        alignment: "center",
        margin: [0, 20, 0, 0], // Margem superior para posicionar a logo
      },
      footer: function (currentPage, pageCount) {
        return {
          text: `Gerado pelo sistema - Página ${currentPage} de ${pageCount}`,
          alignment: "center",
          margin: [0, 20, 0, 0],
        };
      },
      content: [
        {
          text: "RELATÓRIO DA SUPERVISÃO",
          margin: [0, 40, 0, 20],
          style: "header",
          alignment: "center",
        },
        { text: "Identificação", style: "subheader", alignment: "center" },
        {
          text: "Informação do Supervisor",
          bold: true,
          margin: [10, 10, 0, 5],
        },
        { text: `Nome: ${modalInfo.supervisorName}` },
        { text: `Código do Supervisor: ${modalInfo.supervisorCode}` },
        { text: `Feito em: ${formattedDate}` },
        {
          text: `Duração da Supervisão: ${
            modalInfo.time ? modalInfo.time.split(".")[0] : "Não informado"
          }`,
        },
        { text: "" },
        { text: "Informação do Site", bold: true, margin: [20, 10, 0, 5] },
        { text: `Nome do site: ${modalInfo.siteName}` },
        { text: `Centro de custo: ${modalInfo.costCenter}` },
        {
          canvas: [
            { type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 },
          ],
        },

        {
          text: "Informação dos Trabalhadores",
          style: "subheader",
          alignment: "center",
          margin: [0, 10, 0, 10],
        },
        { text: `Trabalhadores Encontrados: ${modalInfo.workersFound}` },
        {
          text: `Faltou: ${
            modalInfo.workerInformation ? modalInfo.workerInformation.length : 0
          }`,
        },
        { text: "Lista dos trabalhadores ausentes:", margin: [0, 0, 0, 10] },
        {
          ul: modalInfo.workerInformation
            ? modalInfo.workerInformation.flatMap((worker) => [
                { text: `Nome: ${worker.name}`, margin: [30, 0, 0, 0] },
                {
                  text: `Número de trabalhador: ${worker.employeeNumber}`,
                  margin: [30, 0, 0, 0],
                },
                { text: `Situação: ${worker.state}`, margin: [30, 0, 0, 0] },
                { text: `OBS: ${worker.obs}`, margin: [30, 0, 0, 10] },
              ])
            : [],
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 },
          ],
        },
        { text: "Equipamentos", style: "subheader", alignment: "center" },
        {
          text: `Quantidade de equipamentos encontrado: ${
            modalInfo.equipment ? modalInfo.equipment.length : 0
          }`,
        },
        { text: "Lista dos equipamentos encontrados:", margin: [0, 0, 0, 10] },
        {
          ul: modalInfo.equipment
            ? modalInfo.equipment.flatMap((equipment) => [
                { text: `Nome: ${equipment.name}`, margin: [30, 0, 0, 0] },
                {
                  text: `Número de série: ${equipment.serialNumber}`,
                  margin: [30, 0, 0, 0],
                },
                { text: `Estado: ${equipment.state}`, margin: [30, 0, 0, 0] },
                { text: `OBS: ${equipment.obs}`, margin: [30, 0, 0, 10] },
              ])
            : [],
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 },
          ],
        },
        {
          text: "Informação extras da supervisão",
          style: "subheader",
          alignment: "center",
        },
        { text: modalInfo.report || "Sem informações adicionais." },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
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
      .download(`relatório_supervisão_${formattedDate}.pdf`);
  };
  const convertImageToDataURL = (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Permitir acesso cross-origin
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
      img.src = imagePath;
    });
  };
  const columns = [
    { field: "createdAt", headerName: "Data", width: 150 },
    { field: "name", headerName: "Nome", width: 350 },
    { field: "supervisorName", headerName: "Supervisor", width: 200 },
    { field: "siteName", headerName: "Site", width: 350 },

    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (params) => (
        <Button variant="info" onClick={() => openModal(params.row)}>
          Detalhes
        </Button>
      ),
    },
  ];

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <h1 style={{ textAlign: "center" }}>Supervisão</h1>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
      >
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
          ></div>
          <input
            type="text"
            placeholder="Pesquisar "
            value={searchSupervisor}
            onChange={(e) => setSearchSupervisor(e.target.value)}
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <label>Início .</label>
          <input
            type="date"
            value={startDate}
            placeholder="Data inicial"
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <label>Fim .</label>
          <input
            placeholder="Data final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: "5px" }}
          />
        </div>{" "}
      </div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <DataGrid
          rows={filteredNotifications.sort(
            (a, b) => b.createdAtDate - a.createdAtDate
          )}
          columns={columns}
          pageSize={10}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { pageSize: 15, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationMode="client"
          pagination
          disableSelectionOnClick
          getRowId={(row) => row.id}
        />
      )}
      {modalInfo && (
        <Modal
          show={verificationModal}
          onHide={() => setVerificationModal(false)}
          size="x"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>RELATÓRIO DA SUPERVISÃO</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h1 style={{ textAlign: "center" }}>IDENTIFICAÇÃO</h1>
            <h3 style={{ marginLeft: "20px" }}>Informação do Supervisor</h3>
            <p>Nome do Supervisor: {modalInfo.supervisorName}</p>
            <p>Código do Supervisor: {modalInfo.supervisorCode}</p>
            <p>Centro de Custo: {modalInfo.costCenter}</p>
            <p>Relatório: {modalInfo.report}</p>
            <h3>Equipamentos</h3>
            {modalInfo.equipment && modalInfo.equipment.length > 0 ? (
              modalInfo.equipment.map((equip, index) => (
                <div key={index}>
                  <p>Nome: {equip.name}</p>
                  <p>Número de Série: {equip.serialNumber}</p>
                  <p>Estado: {equip.state}</p>
                  <p>Observação: {equip.obs}</p>
                </div>
              ))
            ) : (
              <p>Nenhum equipamento registrado.</p>
            )}
            <h3>Trabalhadores Ausentes</h3>
            {modalInfo.workerInformation &&
            modalInfo.workerInformation.length > 0 ? (
              modalInfo.workerInformation.map((worker, index) => (
                <div key={index}>
                  <p>Nome: {worker.name}</p>
                  <p>Número de Empregado: {worker.employeeNumber}</p>
                  <p>Estado: {worker.state}</p>
                  <p>Observação: {worker.obs}</p>
                </div>
              ))
            ) : (
              <p>Nenhum trabalhador ausente registrado.</p>
            )}
            <h1 style={{ textAlign: "center" }}>
              Informação extra da supervisão
            </h1>
            <p>{modalInfo.report}</p>
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
      )}
    </div>
  );
};

export default NotificationList;
