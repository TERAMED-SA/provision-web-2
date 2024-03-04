import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HistoryList.css";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";


function HistoryList() {
    const [historyList, setHistoryList] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const [pageNumber] = useState(0);
    const historyPerPage = 5;

    async function fetchHistory() {

        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}history`
            );
            setHistoryList(response.data.data.data)

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])


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
                <div
                    style={{ textAlign: "center", color: "black", padding: "20px" }}
                >
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
                                name: history.name || "",
                                supervisionId: history.supervisionId,
                                siteCode: history.siteCode,
                            }))}

                    />
                </>
            )}
        </>

    );

}
export default HistoryList
