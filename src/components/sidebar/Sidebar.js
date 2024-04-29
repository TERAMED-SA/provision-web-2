/* eslint-disable jsx-a11y/anchor-is-valid */
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { TiGroup } from "react-icons/ti";
import { IoEyeSharp, IoNotifications } from "react-icons/io5";
import { IoClipboard } from "react-icons/io5";
import { IoLocation } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { IoMdChatboxes } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosTime } from "react-icons/io";

import "react-toastify/dist/ReactToastify.css";
import "./Sidebar.css";
import logo from "../../assets/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ sidebarOpen, closeSidebar }) => {
  const [active, setActive] = useState(null);
  const [notificationNumber, setNotificationNumber] = useState(0);
  const [occurrenceNumber, setOccurrenceNumber] = useState(0);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);

  const fetchNotificationData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}notification/11835?size=500`
      );
      return response.data.data.length;
    } catch (error) {
      console.error("Error fetching notification data:", error.message);
      return 0;
    }
  };

  const fetchOccurrenceData = async () => {
    try {
      const response = await axios.get(
        "https://provision-07c1.onrender.com/api/v1/occurrence"
      );
      return response.data.data.length;
    } catch (error) {
      console.error("Error fetching occurrence data:", error.message);
      return 0;
    }
  };

  const updateNotificationAndOccurrence = async () => {
    const notificationCount = await fetchNotificationData();
    setNotificationNumber(notificationCount);

    const occurrenceCount = await fetchOccurrenceData();
    setOccurrenceNumber(occurrenceCount);
  };

  useEffect(() => {
    updateNotificationAndOccurrence(); // Carrega as notificações e ocorrências ao inicializar
    const interval = setInterval(() => {
      updateNotificationAndOccurrence(); // Atualiza as notificações e ocorrências
    }, 10000); // Atualiza a cada 10 segundos

    return () => clearInterval(interval); // Limpa o intervalo quando o componente é desmontado
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching equipment count
        const equipmentResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/occurrence/"
        );
        setEquipmentCount(equipmentResponse.data.data.data.length);

        // Fetching user count
        const userResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/supervision"
        );
        setUserCount(userResponse.data.data.data.length);

        // Fetching company count
        const companyResponse = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/company?size=100"
        );
        setCompanyCount(companyResponse.data.size);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      className={
        sidebarOpen
          ? "sidebar-responsive"
          : "sidebar d-flex justify-content-btmetween flex-column bg-prim text-white py-3 ps-3 pe-5 vh-100"
      }
      id="sidebar"
    >
      <div>
        <a href="#" className="p-3 text-decoration-none">
          <i className="bi bi-code-splash fs-4 me-4 mb-3"></i>
          <img src={logo} alt="Provision" width={125} />
        </a>
      </div>
      <ul className="nav nav-pills flex-column mt-3">
        <li
          className={active === 1 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(1)}
        >
          <Link to="/Home" className="p-1">
            <i className="me-3 fs-5">
              <FaHome />
            </i>
            <span className="fs-6">Dashboard</span>
          </Link>
        </li>
        <li
          className={active === 2 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(2)}
        >
          <Link to="/users" className="p-1">
            <i className="me-3 fs-5">
              <FaUser />
            </i>
            <span className="fs-6">Utilizadores</span>
          </Link>
        </li>

        <li
          className={active === 4 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(4)}
        >
          <Link to="/Companies" className="p-8">
            <i className="me-3 fs-5">
              <TiGroup />
            </i>
            <span className="fs-8">Clientes</span>
          </Link>
        </li>

        <li
          className={active === 5 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(5)}
        >
          <Link to="/Supervision" className="p-1">
            <i className="me-3 fs-5">
              <IoLocation />
            </i>
            <span className="fs-6">Mapa</span>
          </Link>
        </li>


        <li
          className={active === 7 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(7)}
        >
          <Link to="/Report" className="p-1">
            <i className="me-3 fs-5">
              <IoClipboard />
            </i>
            <span className="fs-6">Relatórios</span>
          </Link>
        </li>
        <li
          className={active === 8 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(8)}
        >
          <Link to="/Occurrence" className="p-1">
            <i className="me-3 fs-5">
              <IoEyeSharp />
            </i>
            <span className="fs-6">Ocorrências <span style={{
              fontWeight: "bold",
              background: "red",
              borderRadius: "10px",
              padding: "5px",
              marginLeft: "3px",
            }}>{equipmentCount}</span></span>
          </Link>
        </li>

        <li
          className={active === 9 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(9)}
        >
          <Link to="/newSupervision" className="p-1">
            <i className="me-3 fs-5">
              <IoIosTime />
            </i>
            <span className="fs-7">Supervisão <span style={{
              fontWeight: "bold",
              background: "red",
              borderRadius: "10px",
              padding: "5px",
              marginLeft: "3px",
            }}>{userCount}</span></span>
          </Link>
        </li>
        <li
          className={active === 10 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(10)}
        >
          <Link to="/Chat" className="p-1">
            <i className="me-3 fs-5">
              <IoMdChatboxes />
            </i>
            <span className="fs-7">Chat</span>
          </Link>
        </li>

        <li className="nav-item p-2">
          <Link to="/" className="p-1">
            <i className="me-3 fs-5">
              <IoMdLogOut />
            </i>
            <span className="fs-6">Sair</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;