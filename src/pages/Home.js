import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser } from "react-icons/fa";
import { TiGroup } from "react-icons/ti";
import LineChart from "../components/charts/LineChart";
import PieChart from "../components/charts/PieChart";

const Home = () => {
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchEquipmentCount = async () => {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/equipment/"
        );
        const data = response.data.data.data;
        setEquipmentCount(data.length);
      } catch (error) {
        console.error("Error fetching equipment count:", error.message);
      }
    };

    const fetchUserCount = async () => {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/user"
        );
        const data = response.data.data.data;
        setUserCount(data.length);
      } catch (error) {
        console.error("Error fetching user count:", error.message);
      }
    };

    const fetchCompanyCount = async () => {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/companySite/"
        );
        const data = response.data.data.data;
        setCompanyCount(data.length);
      } catch (error) {
        console.error("Error fetching company count:", error.message);
      }
    };

    const fetchNotificationCount = async () => {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/notification/11835"
        );
        const data = response.data.data;
        setNotificationCount(data.length);
      } catch (error) {
        console.error("Error fetching notification count:", error.message);
      }
    };

    fetchEquipmentCount();
    fetchUserCount();
    fetchCompanyCount();
    fetchNotificationCount();
  }, []);

  return (
    <div className="p-3 bg-light">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
            <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
              <i className="fs-1">
                <FaUser />
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
                <TiGroup />
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
                <TiGroup />
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
                <TiGroup />
              </i>
              <div>
                <span className="size">Notificações</span>
                <h2 className="text-white">{notificationCount}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-md-8 p-3">
            <LineChart />
          </div>
          <div className="col-12 col-md-4 p-3">
            <PieChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;