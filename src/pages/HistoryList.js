import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HistoryList.css";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";

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
            const formattedHistoryList = response.data.data.data.map((history) => ({
                ...history,
                createdAt: format(new Date(history.createdAt), "dd/MM/yyyy"),
                updatedAt: format(new Date(history.updatedAt), "dd/MM/yyyy"),
                deletedAt: format(new Date(history.deletedAt), "dd/MM/yyyy"),
            }));
            setHistoryList(formattedHistoryList);
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

    const handleDownloadPDF = () => {
        // Lógica para baixar o PDF
        console.log("Baixando PDF...");
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
                                field: "supervisionId",
                                headerName: "ID da Supervisão",
                                width: 200,
                            },
                            {
                                field: "supervisorCode",
                                headerName: "Código do Supervisor",
                                width: 200,
                            },
                        ]}
                        pageSize={5}
                        autoHeight
                        rowHeight={45}
                        onRowClick={(params) => handleViewDetails(params.row)}
                    />
                    <Modal
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
                    </Modal>
                </>
            )}
        </>
    );
}

export default HistoryList;