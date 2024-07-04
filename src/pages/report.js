import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";

import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";

const Report = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    async function fetchReports() {
        try {
            setIsLoading(true);
            const response = await axios.get(
                "https://provision-07c1.onrender.com/api/v1/reports"
            );
            const formattedReports = response.data.data.map((report) => ({
                ...report,
                date: format(new Date(report.date), "dd/MM/yyyy"),
            }));
            setReports(formattedReports);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching reports:", error.message);
            setIsLoading(false);
        }
    }

    return (
        <div className="container4 mr-2" style={{ height: "89vh" }}>
        <h1 style={{ textAlign: "center" }}>
         RELATÓRIOS <span className="badge badge-secondary"></span>
        </h1>
            <div className="container-fluid"><Link to="/Home" className="p-1">Início </Link> / <span>Relatórios</span>
            <br></br> <br></br> 
            
                {isLoading ? (
                    <div className="text-center mt-4">
                        <CircularProgress size={80} thickness={5} />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center text-black mt-4">
                        Funcionalidade ainda não implementada
                    </div>
                ) : (
                    <div style={{ overflow: "auto", maxHeight: "70vh" }}>
                        <DataGrid
                            rows={reports.map((report, index) => ({
                                id: index,
                                date: report.date,
                                title: report.title,
                                description: report.description,
                                status: report.status ? "Aprovado" : "Pendente",
                                creator: report.creator,
                            }))}
                            columns={[
                                { field: "date", headerName: "Data", width: 150 },
                                { field: "title", headerName: "Título", width: 300 },
                                { field: "description", headerName: "Descrição", width: 500 },
                                { field: "status", headerName: "Status", width: 150 },
                                { field: "creator", headerName: "Criador", width: 200 },
                            ]}
                            pageSize={5}
                            autoHeight
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;