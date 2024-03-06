import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HistoryList.css";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from "../assets/logo.png"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function HistoryList() {
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageNumber] = useState(0);
    const historyPerPage = 5;
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [modalShow, setModalShow] = useState(false);

    async function fetchHistory() {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}historic`
            );
            const responseClient = await axios.get(
                `${process.env.REACT_APP_API_URL}companySite?size=500`
            );
            const getCompany = localStorage.getItem('selectedCompany')

            const filterSite = await responseClient.data.data.data.filter(code => code.clientCode === getCompany);
            const formattedHistoryList = await response.data.data.data.map((history) => ({
                ...history,
                createdAt: format(new Date(history.createdAt), "dd/MM/yyyy"),
            }));


            const filteredHistoryList = formattedHistoryList.filter((history) => {
                return filterSite.some((site) => site.costCenter === history.costCenter);
            });

            setHistoryList(filteredHistoryList);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleViewDetails = (history) => {
        setSelectedHistory(history);
        setModalShow(true);
    };

    const getSupByHistoric = async (id) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}historic/${id}`
            );
            return response.data.data;
        } catch (error) {
            console.error(error);
        }
    }
    const getSupById = async (id) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}supervision/${id}`
            );
            return response.data.data
        } catch (error) {
            console.error(error);
        }
    }


    const generatePDF = async (id) => {

        const historicId = await getSupByHistoric(id)
        const dados = await getSupById(historicId.supervisionId)

        // const dados = await getSupInfo(id);
        pdfMake.vfs = pdfFonts.pdfMake.vfs;

        // Converte a imagem para uma URL de dados (data URL)
        const imageDataUrl = await convertImageToDataURL(logo);

        const data = {
            name: "------------------",
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
        <>
            {isLoading && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <CircularProgress size={80} thickness={5} />
                </div>
            )}
            {!isLoading && historyList.length === 0 && (
                <div style={{ textAlign: "center", color: "black", padding: "20px" }}>
                    Sem histórico no momento
                </div>
            )}
            {!isLoading && historyList.length > 0 && (
                <>
                    <DataGrid
                        rows={historyList
                            .slice(
                                pageNumber * historyPerPage,
                                pageNumber * historyPerPage + historyPerPage
                            )
                            .map((history, index) => ({
                                id: index + 1,
                                ...history,
                            }))}
                        columns={[
                            { field: "createdAt", headerName: "Criado em", width: 200 },
                            {
                                field: "costCenter",
                                headerName: "Centro de Custo",
                                width: 200,
                            },
                            {
                                field: "supervisorCode",
                                headerName: "Código do Supervisor",
                                width: 200,
                            },
                            {
                                field: "link",
                                headerName: "Ação",
                                width: 250,
                                renderCell: (params) => (
                                    <div className="d-flex justify-content-center">
                                        <button
                                            className="btn btn-warning btn-sm m-1"
                                            onClick={() => generatePDF(params.row._id)}
                                        >
                                            Gerar PDF
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        pageSize={5}
                        autoHeight
                        rowHeight={45}
                    />
                    {/* <Modal
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        size="lg"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Detalhes do Histórico</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {Object.entries(selectedHistory || {}).map(
                                ([key, value]) =>
                                    key !== "_id" &&
                                    key !== "id" &&
                                    key !== "name" &&
                                    key !== "updatedAt" &&
                                    key !== "deletedAt" && (
                                        <p key={key}>
                                            {key === "createdAt"
                                                ? "Criado em"
                                                : key === "costCenter"
                                                    ? "Centro de Custo"
                                                    : key === "supervisionId"
                                                        ? "ID da Supervisão"
                                                        : key === "supervisorCode"
                                                            ? "Código do Supervisor"
                                                            : key.charAt(0).toUpperCase() + key.slice(1)}
                                            : {value}
                                        </p>
                                    )
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={handleDownloadPDF}>
                                Baixar PDF
                            </Button>
                            <Button variant="secondary" onClick={() => setModalShow(false)}>
                                Fechar
                            </Button>
                        </Modal.Footer>
                    </Modal> */}
                </>
            )}
        </>
    );
}

export default HistoryList;