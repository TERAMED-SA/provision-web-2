import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaFilePdf } from "react-icons/fa6";
import { HiClipboardDocumentList } from "react-icons/hi2";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState({});
  const [modalInfo, setModalInfo] = useState({});
  const [companyInfo, setCompanyInfo] = useState({});
  const [siteInfo, setSiteInfo] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [companyMap, setCompanyMap] = useState({});
  const [siteMap, setSiteMap] = useState({});

  useEffect(() => {
    fetchCompanyData();
    fetchSiteData();
    fetchNotifications();
  }, []);

  async function fetchCompanyData() {
    try {
      const response = await axios.get(
        "https://provision-07c1.onrender.com/api/v1/company?size=500"
      );
      const companies = response.data.data.data;
      const companyMap = companies.reduce((map, company) => {
        map[company.clientCode] = company.name;
        return map;
      }, {});
      setCompanyMap(companyMap);
    } catch (error) {
      console.error("Error fetching company data:", error.message);
    }
  }

  async function fetchSiteData() {
    try {
      const response = await axios.get(
        "https://provision-07c1.onrender.com/api/v1/companySite?size=500"
      );
      const sites = response.data.data.data;
      const siteMap = sites.reduce((map, site) => {
        map[site.costCenter] = site.name;
        return map;
      }, {});
      setSiteMap(siteMap);
    } catch (error) {
      console.error("Error fetching site data:", error.message);
    }
  }

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
        { text: `Nome do Site: ${data.siteName}` },
        { text: `Centro de custo: ${data.costCenter}` },
        { text: "" },
        { text: "Informação da Empresa", bold: 1000, margin: [20, 10, 0, 5] },
        { text: `Nome da Empresa: ${data.companyName}` },
        { text: `Cliente: ${data.companyClientCode}` },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 595 - 2 * 40,
              y2: 5,
              lineWidth: 2,
              lineColor: "#000000",
              margin: [10, 10, 10, 10],
            },
          ],
        },
        { text: "" },
        {
          text: "INFORMAÇÃO DA SUPERVISÃO",
          style: "subheader",
          alignment: "center",
        },
        {
          text: "Relatório da supervisão",
          bold: 1000,
          margin: [0, 15, 0, 15],
        },
        { text: `${data.report}` },

        { text: "EQUIPAMENTO UTILIZADO", bold: 1000, margin: [0, 15, 0, 5] },
        {
          ul: data.equipment.map((equip) => `${equip.quantity}x ${equip.name}`),
        },
        {
          text: "Trabalhadores na Supervisão",
          bold: 1000,
          margin: [0, 15, 0, 5],
        },
        {
          ul: data.workerInformation.map((worker) => `Nome: ${worker.name}`),
        },
        {
          text: "NÚMERO DE TRABALHADORES",
          bold: 1000,
          margin: [0, 15, 0, 5],
        },
        {
          ul: [
            `Número de trabalhadores: ${data.numberOfWorkers}`,
            `Faltou:  ${data.workerInformation.length}`,
          ],
        },
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
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 595 - 2 * 40,
              y2: 5,
              lineWidth: 2,
              lineColor: "#000000",
              margin: [10, 10, 10, 10],
            },
          ],
        },
        {
          text: "Informação extras da supervisão",
          style: "subheader",
          alignment: "center",
          margin: [0, 15, 0, 15],
        },
        {
          text: `${data.report}`,
          margin: [0, 40, 0, 0],
        },
        {
          text: `Data: ${formattedDate}`,
          alignment: "right",
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5],
        },
        bigger: {
          fontSize: 15,
          italics: true,
        },
      },
    };

    pdfMake.createPdf(documentDefinition).download("relatorio_supervisao.pdf");
  };

  async function convertImageToDataURL(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = function (error) {
        reject(error);
      };
      img.src = imageUrl;
    });
  }

  const columns = [
    { field: "information", headerName: "Informação", width: 170 },
    {
      field: "clientCode",
      headerName: "Empresa",
      width: 200,
      valueGetter: (params) =>
        companyMap[params.row.clientCode] || params.row.clientCode,
    },
    {
      field: "costCenter",
      headerName: "Centro de Custo",
      width: 200,
      valueGetter: (params) =>
        siteMap[params.row.costCenter] || params.row.costCenter,
    },
    { field: "createdAt", headerName: "Data", width: 170 },
    {
      field: "actions",
      headerName: "Ações",
      width: 500,
      renderCell: (params) => (
        <div>
          <Button
            className="btn btn-primary btn-sm m-1"
            style={{ marginRight: 8 }}
            onClick={() =>
              openVerificationModal(
                params.row._id,
                params.row.supervisor,
                params.row.costCenter
              )
            }
          >
            Detalhes
          </Button>

          <Button
            className="btn btn-secondary btn-sm m-1"
            onClick={() =>
              generatePDF(
                params.row._id,
                params.row.supervisorName,
                params.row.costCenter
              )
            }
          >
            <FaFilePdf style={{ marginRight: 4 }} />
            Gerar PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: 650, width: "100%", marginTop: "20px" }}>
      <h2>
        SUPERVISÃO <span className="badge badge-secondary"></span>
      </h2>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        / <span>Supervisão</span>
        <br></br> <br></br>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div style={{ height: 630, width: "100%" }}>
            <DataGrid
              rows={notifications}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              getRowId={(row) => row._id}
              disableColumnFilter
              disableColumnMenu
              disableSelectionOnClick
              disableColumnSelector
              autoHeight
              components={{
                NoRowsOverlay: () => (
                  <div style={{ padding: "10px" }}>
                    Nenhuma notificação encontrada
                  </div>
                ),
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 12 },
                },
              }}
            />
            <Modal
              show={verificationModal}
              onHide={closeVerificationModal}
              centered
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>RELATÓRIO DA SUPERVISÃO</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div style={{ fontSize: "20px" }}>
                  <h1 style={{ textAlign: "center" }}>IDENTIFICAÇÃO</h1>
                  <hr />
                  <h3 style={{ marginLeft: "20px" }}>
                    Informação do Supervisor
                  </h3>
                  <p>Nome: {localStorage.getItem("supervisorName")}</p>
                  <p>Código do supervisor: {modalInfo.supervisorCode}</p>
                  <p>Tempo da supersão: {modalInfo.time}</p>
                  <p>Feito em: {modalInfo.createdAt} </p>
                  <hr />
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
                  Gerar PDF .
                  <FaFilePdf />
                </Button>
                <Button
                  onClick={() =>
                    generatePDF(
                      localStorage.getItem("supervisionId"),
                      localStorage.getItem("supervisorName"),
                      localStorage.getItem("supervisionCostCenter")
                    )
                  }
                  variant="primary"
                >
                  Exportar para Exel .
                  <HiClipboardDocumentList />{" "}
                </Button>
              </Modal.Footer>
            </Modal>
            <ToastContainer />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
