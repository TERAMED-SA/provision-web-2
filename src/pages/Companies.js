import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar"; // Importa o componente Avatar
import { css } from "@emotion/react";
import { ClipLoader } from "react-spinners";
import "./Companies.css";
import "./ManagementList.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons"; // Importa ícones
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdGroupOff } from "react-icons/md";
import { MdPeopleAlt } from "react-icons/md";

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
  const [showModal, setShowModal] = useState(false); // Estado para controlar a exibição da modal
  const [searchTerm, setSearchTerm] = useState(""); // Termo de pesquisa
  const [searchResults, setSearchResults] = useState([]); // Resultados da pesquisa
  const [name, setName] = useState(""); // Nome do cliente
  const [nif, setNif] = useState(""); // NIF do cliente
  const [clientCode, setclientCode] = useState(""); // NIF do cliente

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

  // Função para abrir a modal
  const handleAddCompanyClick = () => {
    setShowModal(true);
  };

  // Função para fechar a modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Função para prosseguir ao adicionar cliente
  const handleConfirmAddClient = () => {
    // Aqui você pode adicionar a lógica para adicionar o cliente
    setShowModal(false);
    toast.warning("Funcionalidade ainda não foi implementada");
  };

  // Função para lidar com a pesquisa de clientes
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      let results = companyList;
      if (value) {
        results = companyList.filter(
          (company) =>
            company.name.toLowerCase().includes(value.toLowerCase()) ||
            company.clientCode.toLowerCase().includes(value.toLowerCase())
        );
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Erro ao pesquisar clientes:", error.message);
    }
  };

  return (
    <div className="mr-2" style={{ height: "89vh" }}>
      <h2 style={{ fontSize: "50px" }}>CLIENTES</h2>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        / <span>Clientes</span>
        <br></br> <br></br>
        <div className="space">
          <div className=""></div>
          <div className="">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Nome ou código cliente"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
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
                  className="btn btn-secondary me-2"
                  onClick={toggleSortOrder}
                >
                  <i className="bi bi-arrow-repeat"></i>
                  &nbsp; Inverter Ordem
                </button>
                <button className="btn btn-info" onClick={toggleViewMode}>
                  <i className="bi bi-eye"></i> &nbsp;
                  {viewMode === "list" ? "Mosaico" : "Lista"}
                </button>
                <button
                  className="btn btn-primary ms-2"
                  onClick={handleAddCompanyClick}
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  &nbsp; Adicionar Cliente
                </button>
                <button className="btn btn-success">
                  <MdPeopleAlt />
                  &nbsp;Ativo
                </button>
                <button className="btn btn-danger">
                  <MdGroupOff />
                  &nbsp;Inativos
                </button>
              </div>

              {/* Renderização condicional com base no modo de visualização */}
              <div style={{ overflowY: "auto", height: "calc(89vh - 150px)" }}>
                {searchTerm && searchResults.length > 0 ? (
                  <div>
                    {viewMode === "list" ? (
                      <table>
                        <tbody>
                          {searchResults.map((company, index) => (
                            <tr
                              key={index}
                              onClick={() =>
                                handleItemClick(company.clientCode)
                              }
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
                        {searchResults.map((company, index) => (
                          <div
                            key={index}
                            className="col"
                            onClick={() => handleItemClick(company.clientCode)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="cards h-100 bg-white text-center d-flex flex-column justify-content-center align-items-center">
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
                ) : (
                  <div>
                    {viewMode === "list" ? (
                      <table>
                        <tbody>
                          {companyList.map((company, index) => (
                            <tr
                              key={index}
                              onClick={() =>
                                handleItemClick(company.clientCode)
                              }
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
                            <div className="cards h-100 bg-white text-center d-flex flex-column justify-content-center align-items-center">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;
