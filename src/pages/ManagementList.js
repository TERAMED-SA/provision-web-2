import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHistory,
  faCalendar,
  faWrench,
  faBuildingUser,
  faClipboardCheck,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png";
import axios from "axios";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManagementList = () => {
  const [data] = useState([
    {
      id: 1,
      title: "Funcionários",
      content: "Funcionários da Empresa.",
      icon: faUsers,
      link: "/EmployeeList",
    },
    {
      id: 2,
      title: "Sites",
      content: "Sites da Empresa.",
      icon: faBuildingUser,
      link: "/SiteList",
    },
    {
      id: 4,
      title: "Histórico",
      content: "Lista de Histórico.",
      icon: faHistory,
      link: "/HistoryList",
    },
    {
      id: 5,
      title: "Agendamento",
      content: "Lista de Agendamentos.",
      icon: faCalendar,
      link: "/ScheduleList",
    },
    {
      id: 6,
      title: "Ocorrência",
      content: "Ocorrência Atuais.",
      icon: faExclamationCircle,
      link: "/InventoryList",
    },
    {
      id: 7,
      title: "Relatório",
      content: "Gerar relatório do cliente",
      icon: faClipboardCheck,
      onClick: () => {
        // Adicione sua lógica de função aqui
        // generatePDF();
        toast.error("Funcionalidade ainda não implementada");
      },
    },
  ]);

  const convertImageToDataURL = (imagePath) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      fetch(imagePath)
        .then((response) => response.blob())
        .then((blob) => reader.readAsDataURL(blob))
        .catch(reject);
    });
  };

  const [selectedEmployee] = useState(null);
  const [selectedClientCode, setSelectedClientCode] = useState("");

  useEffect(() => {
    // Buscar o código do cliente no localStorage
    const clientCode = localStorage.getItem("selectedCompany");
    if (clientCode) {
      setSelectedClientCode(clientCode);
    }
  }, []);

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <h2 style={{ fontSize: "50px" }}>
        DETALHES <span className="badge badge-secondary"></span>
      </h2>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">Início </Link> / <Link to="/Companies" className="p-1">Cliente </Link> / <span className="cliente-code">{selectedClientCode}</span>
        <br /> <br /> 
        <div className="container-fluid">
          <h1 className="mb-4"> </h1>
          <div className="row m-3">
            {data.map((item) => (
              <div key={item.id} className="col-12 col-sm-12 col-md-6 col-lg-4">
                {item.onClick ? (
                  <div
                    className="card1 mb-3 list-group-item list-group-item-action rounded styleborder"
                    style={{ cursor: "pointer" }}
                    onClick={item.onClick}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={item.icon} className="mr-2 icon" />
                        <h5 className="card-title titleStyle">{item.title}</h5>
                      </div>
                      <p className="card-text">{item.content}</p>
                    </div>
                  </div>
                ) : (
                  <a
                    href={item.link}
                    className="text-decoration-none"
                    style={{ color: "inherit" }}
                  >
                    <div
                      className="card1 mb-3 list-group-item list-group-item-action rounded styleborder"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={item.icon} className="mr-2 icon" />
                          <h5 className="card-title titleStyle">{item.title}</h5>
                        </div>
                        <p className="card-text">{item.content}</p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>

          {selectedEmployee && (
            <div className="mt-4">
              <h2>Detalhes do Funcionário</h2>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{selectedEmployee.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {selectedEmployee.position}
                  </h6>
                  <p className="card-text">{selectedEmployee.details}</p>
                </div>
              </div>
            </div>
          )}
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default ManagementList;
