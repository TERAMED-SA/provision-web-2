import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar"; // Importa o componente Avatar
import { css } from "@emotion/react";
import { ClipLoader } from "react-spinners";
import "./Companies.css";
import "./ManagementList.css";

// CSS override for spinner
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Companies = () => {
  const navigate = useNavigate();
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true); // Estado para controlar a ordem
  const [numClients, setNumClients] = useState(0); // Adicionado para armazenar o número de clientes
  const [viewMode, setViewMode] = useState("list"); // Modo de visualização: lista ou mosaico

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}company?size=100`
        );
        let sortedCompanies = response.data.data.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        if (!sortAsc) {
          sortedCompanies = sortedCompanies.reverse(); // Inverte a ordem se necessário
        }
        setCompanyList(sortedCompanies);
        setNumClients(sortedCompanies.length); // Define o número de clientes
      } catch (error) {
        console.error("Erro:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, [sortAsc]); // Adiciona sortAsc à lista de dependências

  // Handle click event for company item
  const handleItemClick = (clientCode) => {
    localStorage.setItem("selectedCompany", clientCode);
    navigate("/managementList");
  };

  // Função para inverter a ordem dos nomes das empresas
  const toggleSortOrder = () => {
    setSortAsc(!sortAsc); // Alterna entre ordem crescente e decrescente
  };

  // Função para alternar entre visualização em lista e em mosaico
  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "mosaic" : "list");
  };

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <h2 style={{ fontSize: "50px" }}>
        CLIENTES <span className="badge badge-secondary">{numClients}</span>
      </h2>
      <div className="container-fluid">
        <div className="container4">
          {loading ? (
            // Display spinner when loading
            <div className="loading-spinner d-flex justify-content-center align-items-center">
              <ClipLoader
                color="blue"
                loading={loading}
                size={150}
                css={override}
              />
            </div>
          ) : (
            // Display company list when loaded
            <div>
              {/* Botões para alternar a visualização */}
              <div className="mb-2">
                <button
                  className="btn btn-primary me-2"
                  onClick={toggleSortOrder}
                >
                  <i class="bi bi-arrow-repeat"></i>
                  &nbsp; Inverter Ordem
                </button>
                <button className="btn btn-success" onClick={toggleViewMode}>
                  <i class="bi bi-eye"></i> &nbsp;
                  {viewMode === "list" ? "Mosaico" : "Lista"}
                </button>
              </div>
              {/* Renderização condicional com base no modo de visualização */}
              {viewMode === "list" ? (
                <table>
                  <tbody>
                    {companyList.map((company, index) => (
                      <tr
                        key={index}
                        onClick={() => handleItemClick(company.clientCode)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="company-name">
                          {/* Utiliza o componente Avatar para mostrar as iniciais do nome da empresa */}
                          <Avatar
                            className="justify-content-center align-items-center"
                            name={company.name}
                            size="50"
                            round={true}
                          />
                          {company.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="row row-cols-1 row-cols-md-4 g-4">
                  {companyList.map((company, index) => (
                    <div
                      key={index}
                      className="col"
                      onClick={() => handleItemClick(company.clientCode)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="cards h-100 bg-white text-center d-flex flex-column justify-content-center align-items-center"
                        style={{ color: "black" }}
                      >
                        {/* Adiciona o avatar apenas no modo de mosaico */}
                        <Avatar
                          className="mb-3"
                          name={company.name}
                          size="100"
                          round={true}
                        />
                        <h5 className="card-title">{company.name}</h5>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;