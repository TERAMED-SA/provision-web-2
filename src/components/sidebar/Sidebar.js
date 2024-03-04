/* eslint-disable jsx-a11y/anchor-is-valid */
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { TiGroup } from "react-icons/ti";
import { IoEyeSharp, IoNotifications } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { IoMdChatboxes } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import axios from "axios";

//import React from 'react';
import "./Sidebar.css";
import logo from "../../assets/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";

const Sidebar = ({ sidebarOpen, closeSidebar }) => {
  const [active, setActive] = useState();
  const [notificationNumber, setNotificationNumber] = useState(0);

  async function findNotification() {
    try {
      const notificationResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}notification/11835?size=500`
      );
      console.log();
      setNotificationNumber(notificationResponse.data.data.length);
    } catch (error) {
      console.error("Error fetching sites:", error.message);
    }
  }
  useEffect(() => {
    findNotification();
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
              <IoEyeSharp />
            </i>
            <span className="fs-6">Supervisão</span>
          </Link>
        </li>

        <li
          className={active === 6 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(5)}
        >
          <Link to="/Notification" className="p-1">
            <i className="me-3 fs-5">
              <IoNotifications />
            </i>
            <span className="fs-6">
              Notificações{" "}
              <span style={{ fontWeight: "bold", marginLeft: "3px" }}>
                {notificationNumber}
              </span>
            </span>
          </Link>
        </li>

        <li
          className={active === 7 ? "active nav-item p-2" : "nav-item p-2"}
          onClick={(e) => setActive(7)}
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
