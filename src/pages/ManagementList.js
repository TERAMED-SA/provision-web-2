import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHistory,
  faCalendar,
  faBuildingUser,
  faClipboardCheck,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManagementList = () => {
  const [data] = useState([
    //{/*  {
    // id: 1,
    //  title: "Funcionários",
    // content: "Funcionários nos sites do cliente.",
    //  icon: faUsers,
    //  link: "/EmployeeList",
    //  }*},
    {
      id: 1,
      title: "Sites",
      content: "Sites do Cliente.",
      icon: faBuildingUser,
      link: "/SiteList",
    },
    {
      id: 2,
      title: "Agendamento",
      content: "Agendar supervisão para um Supervisor.",
      icon: faCalendar,
      link: "/ScheduleList",
    },
    {
      id: 3,
      title: "Ocorrência",
      content: "Ocorrência do cliente.",
      icon: faExclamationCircle,
      link: "/InventoryList",
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
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    // Buscar o código do cliente no localStorage
    const clientCode = localStorage.getItem("selectedCompany");
    console.log("Client Code from localStorage:", clientCode); // Verificação do clientCode
    if (clientCode) {
      setSelectedClientCode(clientCode);
    }

    // Buscar os dados das companhias da API
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/company?size=500"
        );
        const companies = response.data.data.data;
        console.log("Companies data:", companies); // Verificação dos dados da API

        // Encontrar a empresa correspondente ao código do cliente
        const company = companies.find(
          (comp) => comp.clientCode === clientCode
        );
        if (company) {
          setCompanyName(company.name);
          console.log("Company found:", company); // Verificação da empresa encontrada
        } else {
          console.log("No company found for the given clientCode");
        }
      } catch (error) {
        console.error("Erro ao buscar Empresa: ", error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <h2 style={{ fontSize: "50px" }}>
        DETALHES <span className="badge badge-secondary"></span>
      </h2>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        /{" "}
        <Link to="/Companies" className="p-1">
          Cliente{" "}
        </Link>{" "}
        / <span className="cliente-code">{companyName}</span>
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
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="mr-2 icon"
                        />
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
                          <FontAwesomeIcon
                            icon={item.icon}
                            className="mr-2 icon"
                          />
                          <h5 className="card-title titleStyle">
                            {item.title}
                          </h5>
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
