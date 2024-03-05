import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHistory,
  faCalendar,
  faWrench,
  faBuildingUser,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png"
import axios from "axios";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

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
      id: 6,
      title: "Ocorrência",
      content: "Ocorrência Atuais.",
      icon: "",
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
      },
    },
  ]);

  // const generatePDF = async (id, name) => {
  //   // const dados = await getSupInfo(id);
  //   pdfMake.vfs = pdfFonts.pdfMake.vfs;

  //   // Converte a imagem para uma URL de dados (data URL)
  //   const imageDataUrl = await convertImageToDataURL(logo);

  //   const data = {
  //     name: name,
  //     createdAt: dados.createdAt,
  //     supervisorCode: dados.supervisorCode,
  //     workerInformation: dados.workerInformation,
  //     numberOfWorkers: dados.numberOfWorkers,
  //     desiredNumber: dados.desiredNumber,
  //     equipment: dados.equipment,
  //     taskId: dados.taskId ? dados.taskId : "",
  //     time: dados.time,
  //     costCenter: dados.costCenter,
  //     report: dados.report,
  //   };

  //   // Defina o conteúdo do documento PDF
  //   const documentDefinition = {

  //     footer: function (currentPage, pageCount) {
  //       return {
  //         text: `Gerado pelo sistema - Página ${currentPage} de ${pageCount}`,
  //         alignment: 'center',
  //         margin: [0, 20, 0, 0]
  //       };
  //     },

  //     content: [
  //       { image: imageDataUrl, width: 70, margin: [0, 0, 0, 30], alignment: 'center' },
  //       { text: 'RELATÓRIO DA SUPERVISÃO', margin: [0, 0, 0, 40], style: 'header', alignment: 'center' },
  //       { text: 'Identificação', style: 'subheader', alignment: 'center' },
  //       { text: `Nome: ${data.name}` },
  //       { text: `Feito em: ${data.createdAt.toLocaleString()}` },
  //       { text: `Código do Supervisor: ${data.supervisorCode}` },
  //       { text: `Número Desejado: ${data.desiredNumber}` },
  //       { text: `Número de Trabalhadores encontrados: ${data.numberOfWorkers}` },
  //       { text: `Tempo: ${data.time}` },
  //       { text: `Centro de custo: ${data.costCenter}` },
  //       { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }] },
  //       { text: 'Informação dos Trabalhadores', style: 'subheader', alignment: 'center' },
  //       {
  //         ul: data.workerInformation.flatMap((worker) => ([
  //           `Nome: ${worker.name}`,
  //           `Número de trabalhador: ${worker.employeeNumber}`,
  //           `Sitação: ${worker.state}`,
  //           `OBS: ${worker.obs}`,
  //           { text: '', margin: [0, 0, 0, 10] }
  //         ]))
  //       },
  //       { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }] },
  //       { text: 'Equipamentos', style: 'subheader', alignment: 'center' },
  //       {
  //         ul: data.equipment.flatMap((equipment) => ([
  //           `Nome: ${equipment.name}`,
  //           `Número de série: ${equipment.serialNumber}`,
  //           `Estado: ${equipment.state}`,
  //           `Centro de custo: ${equipment.costCenter}`,
  //           `OBS: ${equipment.obs}`,
  //           { text: '', margin: [0, 0, 0, 10] }
  //         ])),
  //       },
  //       { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 1 }] },
  //       { text: 'Informação extras da supervisão', style: 'subheader', alignment: 'center' },
  //       { text: `${data.report}`, alignment: 'center' }

  //     ],
  //     styles: {
  //       header: {
  //         fontSize: 22,
  //         bold: false,
  //         margin: [0, 0, 0, 10]
  //       },
  //       subheader: {
  //         fontSize: 14,
  //         bold: true,
  //         margin: [0, 10, 0, 5]
  //       }
  //     }
  //   };

  //   pdfMake.createPdf(documentDefinition).download();
  // };
  const convertImageToDataURL = (imagePath) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      fetch(imagePath)
        .then(response => response.blob())
        .then(blob => reader.readAsDataURL(blob))
        .catch(reject);
    });
  };
  const [selectedEmployee] = useState(null);

  return (
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
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="mr-2 icon"
                      />
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
    </div>
  );
};

export default ManagementList;
