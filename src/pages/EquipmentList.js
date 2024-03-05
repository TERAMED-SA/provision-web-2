import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import { format } from "date-fns";

function EquipmentList() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const equipmentPerPage = 5;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const costCenter = urlParams.get("costCenter");
    if (costCenter) {
      fetchEquipment(costCenter);
    }
  }, []);

  const fetchEquipment = async (costCenter) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://provision-07c1.onrender.com/api/v1/equipment/`
      );
      const filteredEquipment = response.data.data.data.filter(
        (equipment) => equipment.costCenter === costCenter
      );
      setEquipmentList(filteredEquipment);
    } catch (error) {
      console.error("Error fetching equipment:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const columns = [
    { field: "name", headerName: "Nome", width: 200 },
    { field: "_id", headerName: "ID", width: 200 },
    { field: "createdAt", headerName: "Criado em", width: 200 },
    { field: "serialNumber", headerName: "Número de Série", width: 200 },
    { field: "state", headerName: "Estado", width: 200 },
    { field: "supervisorCode", headerName: "Supervisor/Código", width: 200 },
  ];

  return (
    <div className="container">
      <h2 className="text-center mb-4">EQUIPAMENTOS</h2>
      {isLoading && (
        <div className="text-center mt-4">
          <CircularProgress size={80} thickness={5} />
        </div>
      )}
      {!isLoading && equipmentList.length === 0 && (
        <div className="text-center text-black mt-4">
          Nenhum equipamento foi encontrado para este site.
        </div>
      )}
      {!isLoading && equipmentList.length > 0 && (
        <DataGrid
          rows={equipmentList
            .slice(
              pageNumber * equipmentPerPage,
              pageNumber * equipmentPerPage + equipmentPerPage
            )
            .map((equipment, index) => ({
              id: index + 1,
              ...equipment,
              createdAt: format(new Date(equipment.createdAt), "dd/MM/yyyy"),
              updatedAt: format(new Date(equipment.updatedAt), "dd/MM/yyyy"),
              deletedAt: format(new Date(equipment.deletedAt), "dd/MM/yyyy"),
            }))}
          columns={columns}
          pageSize={equipmentPerPage}
          rowCount={equipmentList.length}
          pagination
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default EquipmentList;