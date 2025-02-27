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
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [metricsData, setMetricsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        `${process.env.REACT_APP_API_URL}supervision?size=100`
      );

      const formattedNotifications = response.data.data.data.map(
        (supervision) => ({
          id: supervision._id,
          ...supervision,
          createdAt: format(new Date(supervision.createdAt), "dd/MM/yyyy"),
          createdAtDate: new Date(supervision.createdAt),
          createdAtTime: format(new Date(supervision.createdAt), "HH:mm"),
          supervisorName: "Carregando...",
          siteName: "Carregando...",
        })
      );

      // Sort notifications by date in descending order (most recent first)
      const sortedNotifications = formattedNotifications.sort(
        (a, b) => new Date(b.createdAtDate) - new Date(a.createdAtDate)
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Error fetching supervisions:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/metrics?size=100&page=1`
      );
      setMetricsData(response.data.data.sites);
      updateNotificationsWithMetrics(response.data.data.sites);
    } catch (error) {
      console.error("Error fetching metrics:", error.message);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching equipment count
        const equipmentResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}equipment?size=500`
        );
        setEquipmentCount(equipmentResponse.data.data.data.length);

        // Fetching user count
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}user?size=500`
        );
        setUserCount(userResponse.data.data.data.length);

        // Fetching company count
        const companyResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}company?size=500`
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
            createdAtDate: new Date(notification.createdAt),
            supervisorName: "Carregando...",
            siteName: "Carregando...",
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

        // Fetch metrics data
        const metricsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/metrics?size=100&page=1`
        );
        setMetricsData(metricsResponse.data.data.sites);
        updateNotificationsWithMetrics(
          metricsResponse.data.data.sites,
          lastTwoNotifications
        );
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
      }
    };

    fetchData();
  }, []);

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

  const columns = [
    { field: "createdAt", headerName: "Data", width: 150 },
    { field: "name", headerName: "Nome", width: 300 },
    { field: "supervisorName", headerName: "Supervisor", width: 200 },
    { field: "siteName", headerName: "Site", width: 200 },
  ];

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
              <Link to="/team" className="card-link">
                <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm card-hover">
                  <i className="fs-1">
                    <i className="bi bi-person-check-fill"></i>
                  </i>
                  <div>
                    <span className="size">Supervisores</span>
                    <h2 className="text-white">{userCount}</h2>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
              <Link to="/Companies" className="card-link">
                <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm card-hover">
                  <i className="fs-1">
                    <i className="bi bi-building-check"></i>
                  </i>
                  <div>
                    <span className="size">Empresas</span>
                    <h2 className="text-white">{companyCount}</h2>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
              <Link to="/statistic" className="card-link">
                <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm card-hover">
                  <i className="fs-1">
                    <i className="bi bi-gear-wide-connected"></i>
                  </i>
                  <div>
                    <span className="size">Equipamentos</span>
                    <h2 className="text-white">{equipmentCount}</h2>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
              <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
                <i className="fs-1">
                  <i className="bi bi-bell-fill"></i>
                </i>
                <div>
                  <span className="size">Notificações do sistema</span>
                  <h2 className="text-white">{totalNotifications}</h2>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-8 p-3"></div>
            <div className="col-12 col-md-4 p-3"></div>
          </div>
          <div className="row">
            <h2>Últimas Atividades</h2>
            <div style={{ height: 100, width: "100%" }}>
              {isLoading ? (
                <p>Carregando...</p>
              ) : (
                <DataGrid
                rows={[...notifications].sort((a, b) => b.createdAtDate - a.createdAtDate)}
                columns={columns}
                autoHeight
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationMode="client"
                pagination
                disableSelectionOnClick
                getRowId={(row) => row.id}
              />
              

              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
