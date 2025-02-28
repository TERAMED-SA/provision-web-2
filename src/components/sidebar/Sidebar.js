import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { AiOutlineTeam } from "react-icons/ai";
import { TfiMapAlt } from "react-icons/tfi";
import { FcBullish } from "react-icons/fc";
import { IoMdLogOut } from "react-icons/io";
import { IoEyeSharp } from "react-icons/io5";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineHistory } from "react-icons/ai";
import { IoPersonCircleOutline } from "react-icons/io5";
import "./Sidebar.css";
import logo from "../../assets/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdAccountCircle } from "react-icons/md";
import { AiOutlineLineChart } from "react-icons/ai";

const Sidebar = ({ sidebarOpen, closeSidebar }) => {
  const [active, setActive] = useState(null);
  const [occurrenceNumber, setOccurrenceNumber] = useState(0);
  const [supervisionNumber, setSupervisionNumber] = useState(0);
  const navigate = useNavigate();

  // Recuperar o nome do usuário do localStorage
  const userName = localStorage.getItem("userName");

  // Redirecionar para a página de login se o usuário for desconhecido
  useEffect(() => {
    if (!userName) {
      navigate("/login");
    }
  }, [userName, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Função para obter a data atual no formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchOccurrenceData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}occurrence?size=500`
      );
      const currentDate = getCurrentDate();
      
      const occurrences = response.data.data.data || [];
      const filteredOccurrences = occurrences.filter(
        (item) => item.createdAt.split("T")[0] === currentDate
      );
      
      return filteredOccurrences.length;
    } catch (error) {
      console.error("Error fetching occurrence data:", error.message);
      return 0;
    }
  };
  
  

  const fetchSupervisionData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}supervision?size=100`
      );
      const currentDate = getCurrentDate();

      // Access the nested data structure correctly
      const supervisions = response.data.data.data || [];
      const filteredSupervisions = supervisions.filter(
        (item) => item.createdAt.split("T")[0] === currentDate
      );

      return filteredSupervisions.length;
    } catch (error) {
      console.error("Error fetching supervision data:", error.message);
      return 0;
    }
  };

  const updateNotificationAndOccurrence = async () => {
    const occurrenceCount = await fetchOccurrenceData();
    setOccurrenceNumber(occurrenceCount);

    const supervisionCount = await fetchSupervisionData();
    setSupervisionNumber(supervisionCount);
  };

  useEffect(() => {
    updateNotificationAndOccurrence(); // Carrega as notificações e ocorrências ao inicializar
    const interval = setInterval(() => {
      updateNotificationAndOccurrence(); // Atualiza as notificações e ocorrências
    }, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval); // Limpa o intervalo quando o componente é desmontado
  }, []);

  return (
    <div
      style={{ overflowY: "scroll", height: "100vh" }}
      className={
        sidebarOpen
          ? "sidebar-responsive"
          : "sidebar d-flex justify-content-btmetween flex-column bg-prim text-white py-3 ps-3 pe-5 vh-100"
      }
      id="sidebar"
    >
      <div>
        <a href="#" className="p-3 text-decoration-none">
          <img src={logo} alt="Provision" width={125} />
        </a>
      </div>
      <ul className="nav nav-pills flex-column mt-3">
        <span
          style={{
            fontWeight: "bold",
            background: "#FFF",
            borderRadius: "5px",
            padding: "5px",
            marginLeft: "3px",
            color: "black",
          }}
          className="fs-6"
        >
          <MdAccountCircle />{" "}
          {userName ? ` ${userName}` : "Usuário: Desconhecido"}
        </span>
        <li
          className={active === 1 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(1)}
        >
          <Link to="/Home" className="p-1">
            <i className="me-3 fs-5">
              <FaHome />
            </i>
            <span className="fs-6">Início</span>
          </Link>
        </li>
        <li
          className={active === 3 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(3)}
        >
          <Link to="/users" className="p-1">
            <i className="me-3 fs-5">
              {" "}
              <IoPersonCircleOutline />
            </i>

            <span className="fs-6">Supervisores</span>
          </Link>
        </li>
        <li
          className={active === 4 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(4)}
        >
          <Link to="/Companies" className="p-1">
            <i className="me-3 fs-5">
              <AiOutlineTeam />
            </i>
            <span className="fs-8">Clientes</span>
          </Link>
        </li>
        <li
          className={active === 5 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(5)}
        >
          <Link to="/Map" className="p-1">
            <i className="me-3 fs-5">
              <TfiMapAlt />
            </i>
            <span className="fs-6">Mapa</span>
          </Link>
        </li>
        {/*  <li
          className={active === 8 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(8)}
        >
          <Link to="/Occurrence" className="p-1">
            <i className="me-3 fs-5">
              <IoEyeSharp />
            </i>
            <span className="fs-6">
              Ocorrências{" "}
              <span
                style={{
                  fontWeight: "bold",
                  background: "red",
                  borderRadius: "10px",
                  padding: "5px",
                  marginLeft: "3px",
                }}
              >
                {occurrenceNumber}
              </span>
            </span>
          </Link>
        </li> */}
        <li
          className={active === 8 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(8)}
        >
          <Link to="/Occurrence" className="p-1">
            <i className="me-3 fs-5">
              {" "}
              <IoEyeSharp />
            </i>
            <span className="fs-6">
              Ocorrências{" "}
              <span
                style={{
                  fontWeight: "bold",
                  background: "red",
                  borderRadius: "10px",
                  padding: "5px",
                  marginLeft: "3px",
                }}
              >
                {" "}
                {occurrenceNumber}{" "}
              </span>
            </span>
          </Link>
        </li>
        <li
          className={active === 9 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(9)}
        >
          <Link to="/newSupervision" className="p-1">
            <i className="me-3 fs-5">
              <AiOutlineHistory />
            </i>
            <span className="fs-7">
              Supervisão{" "}
              <span
                style={{
                  fontWeight: "bold",
                  background: "red",
                  borderRadius: "10px",
                  padding: "5px",
                  marginLeft: "3px",
                }}
              >
                {supervisionNumber}
              </span>
            </span>
          </Link>
        </li>
        <li
          className={active === 7 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(7)}
        >
          <Link to="/Report" className="p-1">
            <i className="me-3 fs-5">
            <AiOutlineLineChart />
            </i>
            <span className="fs-6">Estatística</span>
          </Link>
        </li>
        <li className="nav-item p-2">
          <a href="#" onClick={handleLogout} className="p-1">
            <i className="me-3 fs-5">
              <IoMdLogOut />
            </i>
            <span className="fs-6">Sair</span>
          </a>
        </li>
      </ul>
      <div
        className="sidebar-footer text-center p-2 mt-auto"
        style={{ color: "white" }}
      >
        <br />
        <span className="fs-6">Versão 1.1</span>
      </div>
    </div>
  );
};

export default Sidebar;
