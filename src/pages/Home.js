import "./Home.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";

const Home = () => {
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentOccurrences, setRecentOccurrences] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching equipment count
        const equipmentResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/equipment?size=500"
        );
        setEquipmentCount(equipmentResponse.data.data.data.length);

        // Fetching user count
        const userResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/user?size=500"
        );
        setUserCount(userResponse.data.data.data.length);

        // Fetching company count
        const companyResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/company?size=500"
        );
        setCompanyCount(companyResponse.data.data.data.length);

        // Fetching notification count
        const notificationResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}notification/11835?size=100`
        );
        setNotificationCount(notificationResponse.data.data.length);

        // Fetching the last two occurrences
        const user = localStorage.getItem("userId");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}notification/${user}?size=500`
        );
        const formattedNotifications = response.data.data.map(
          (notification) => ({
            ...notification,
            createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
          })
        );

        // Ordenar as notificações por data
        const sortedNotifications = formattedNotifications.sort((a, b) => {
          const dateA = new Date(a.createdAt.split("/").reverse().join("-"));
          const dateB = new Date(b.createdAt.split("/").reverse().join("-"));
          return dateB - dateA;
        });

        // Pegar apenas as duas últimas
        const lastTwoNotifications = sortedNotifications.slice(0, 9);
        setNotifications(lastTwoNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container4">
      <h1 style={{ textAlign: "center" }}>
        INÍCIO <span className="badge badge-secondary"></span>
      </h1>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>
        <br></br> <br></br>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
              <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
                <i className="fs-1">
                  <i className="bi bi-person-check-fill"></i>
                </i>
                <div>
                  <span className="size">Supervisores</span>
                  <h2 className="text-white">{userCount}</h2>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
              <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
                <i className="fs-1">
                  <i className="bi bi-building-check"></i>
                </i>
                <div>
                  <span className="size">Empresas</span>
                  <h2 className="text-white">{companyCount}</h2>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
              <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
                <i className="fs-1">
                  <i className="bi bi-gear-wide-connected"></i>
                </i>
                <div>
                  <span className="size">Equipamentos</span>
                  <h2 className="text-white">{equipmentCount}</h2>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
              <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
                <i className="fs-1">
                  <i className="bi bi-bell-fill"></i>
                </i>
                <div>
                  <span className="size">Notificações do sistema</span>
                  <h2 className="text-white">{notificationCount}</h2>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-8 p-3"></div>
            <div className="col-12 col-md-4 p-3"></div>
          </div>
          <div className="row">
            <h2>Últimas Atividades</h2>
            <div style={{ height: 600, width: "100%" }}>
              <DataGrid
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#0d6efd", // Cor azul do cabeçalho
                    color: "#fff", // Cor do texto do cabeçalho em branco
                  },
                }}
                rows={notifications.map((notification, index) => ({
                  id: index,
                  data: notification.createdAt,
                  evento: notification.information,
                  supervisor: notification.supervisorName,
                  clienteName: notification.siteName,
                  estado: notification.state ? "Validado" : "Pendente",
                }))}
                columns={[
                  { field: "data", headerName: "Data", width: 150 },
                  { field: "evento", headerName: "Evento", width: 150 },
                  { field: "supervisor", headerName: "Supervisor", width: 300 },
                  {
                    field: "clienteName",
                    headerName: "Centro de custo",
                    width: 200,
                  },
                  { field: "estado", headerName: "Estado", width: 100 },
                ]}
                pageSize={10}
                pagination={false}
                pageSizeOptions={[]} // Remove a opção "Rows per page"
                hideFooterPagination // Esconde a paginação
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
