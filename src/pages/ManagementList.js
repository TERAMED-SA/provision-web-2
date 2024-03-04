import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ManagementList.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHistory,
  faCalendar,
  faWrench,
  faBuildingUser,
  faClipboardCheck, // Adicionado: Importar o ícone para Empresas
} from "@fortawesome/free-solid-svg-icons";

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
      id: 3,
      title: "Equipamentos e Máquinas",
      content: "Equipamentos Cadastrados.",
      icon: faWrench,
      link: "/EquipmentList",
    },
    {
      id: 4,
      title: "Históricos",
      content: "Lista de Histórico.",
      icon: faHistory,
      link: "/HistoryList",
    },
    {
      id: 5,
      title: "Agendamentos",
      content: "Lista de Agendamentos.",
      icon: faCalendar,
      link: "/ScheduleList",
    },
    {
      id: 6, // Adicionado: ID para Empresas
      title: "Inventário", // Adicionado: Título para Empresas
      content: "Inventários.", // Adicionado: Conteúdo para Empresas
      icon: faClipboardCheck, // Adicionado: Ícone para Empresas
      link: "/InventoryList", // Adicionado: Link para Empresas
    },
    // Adicione mais informações aqui...
  ]);

  const [selectedEmployee] = useState(null);

  return (
    <div className="container-fluid">
      <h1 className="mb-4"> </h1>
      <div className="row m-3">
        {data.map((item) => (
          <div key={item.id} className="col-12 col-sm-12 col-md-6 col-lg-4">
            <Link to={item.link} className="text-decoration-none">
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
            </Link>
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
    </div>
  );
};

export default ManagementList;
