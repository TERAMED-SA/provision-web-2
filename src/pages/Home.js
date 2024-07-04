import "./Home.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import LineChart from "../components/charts/LineChart";
import PieChart from "../components/charts/PieChart";

const Home = () => {
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching equipment count
        const equipmentResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/equipment/"
        );
        setEquipmentCount(equipmentResponse.data.data.data.length);

        // Fetching user count
        const userResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/user"
        );
        setUserCount(userResponse.data.data.data.length);

        // Fetching company count
        const companyResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/company?size=100"
        );
        setCompanyCount(companyResponse.data.size);

        // Fetching notification count
        const notificationResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}notification/11835?size=500`
        );
        setNotificationCount(notificationResponse.data.data.length);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

  return (

    <div className="container4">
    <h1 style={{ textAlign: "center" }}>
  INÍCIO <span className="badge badge-secondary"></span>
    </h1>
        <div className="container-fluid"><Link to="/Home" className="p-1">Início </Link>
        <br></br> <br></br> 

      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
            <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
              <i className="fs-1">
                <i className="bi bi-person-check-fill"></i>
              </i>
              <div>
                <span className="size">Utilizadores</span>
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
                <span className="size">Notificações</span>
                <h2 className="text-white">{notificationCount}</h2>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-8 p-3">

          </div>
          <div className="col-12 col-md-4 p-3">
            <PieChart />
          </div>
        </div>
      </div>
    </div>
    </div>

  );
};

export default Home;