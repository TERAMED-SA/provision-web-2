/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { TableCell, Modal, styled } from "@mui/material";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./ScheduleList.css";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  head: {
    backgroundColor: "#1d09b2",
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}));
function ScheduleList() {
  const [scheduleList, setScheduleList] = useState([]);
  const [supervisorList, setSupervisorList] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [siteListFilter, setSiteListFilter] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [schedulePerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [description, setDescription] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [site, setSite] = useState("");

  async function fetchSchedule() {
    try {
      const [supervisorResponse, siteResponse, taskResponse] =
        await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}user?size=50`),
          axios.get(`${process.env.REACT_APP_API_URL}companySite?size=500`),
          axios.get(`${process.env.REACT_APP_API_URL}task/`),
        ]);
      const clientCode = localStorage.getItem("selectedCompany");
      const filterSite = await siteResponse.data.data.data.filter(
        (site) => site.clientCode === clientCode
      );
      const filterUser = await supervisorResponse.data.data.data.filter(
        (user) => user.mecCoordinator !== ! ""
      );
      const supervisorCodes = filterSite.map((site) => site.supervisorCode);
      const siteCodes = filterSite.map((site) => site.costCenter);
      const filterUserSite = filterUser.filter((user) =>
        supervisorCodes.includes(user.employeeId)
      );
      const filterTask = taskResponse.data.data.data.filter((task) =>
        siteCodes.includes(task.costCenter)
      );
      setScheduleList(filterTask);
      setSupervisorList(filterUserSite);
      setSiteList(filterSite);
    } catch (error) {
      console.error("Erro:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function validateSupervisorSite(id) {
    try {
      const filter = siteList.filter(
        (supervisor) => supervisor.supervisorCode === id
      );
      setSiteListFilter(filter);
    } catch (error) { }
  }

  async function validateSite(id) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}companySite/${id}`
      );
      return {
        name: response.data.data.name,
        companyId: response.data.data.companyId,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Recurso não encontrado.");
      } else {
        console.error("Erro desconhecido:", error.message);
      }
    }
  }

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    setPageNumber(page);
  };

  const openModal = () => {
    // console.log(isModalOpen)
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null); // Limpar os dados de edição ao fechar o modal
  };

  const handleSubmit = () => {
    console.log("Novo agendamento:", newSchedule);
    console.log("Site selecionado:", selectedSite);
    closeModal();
  };

  const handleOpenEditModal = (row) => {
    setEditingSchedule(row);
    setIsModalOpen(true);
  };

  const handleEditSubmit = () => {
    const updatedScheduleList = scheduleList.map((schedule) =>
      schedule.id === editingSchedule.id ? editingSchedule : schedule
    );
    setScheduleList(updatedScheduleList);
    closeModal();
  };

  const handleDelete = (scheduleId) => {
    console.log("Remove clicked for schedule ID:", scheduleId);
    const updatedScheduleList = scheduleList.filter(
      (schedule) => schedule.id !== scheduleId
    );
    setScheduleList(updatedScheduleList);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSupervisorChange = (event) => {
    setSupervisor(event.target.value);
    validateSupervisorSite(event.target.value);
  };

  const handleSiteChange = (event) => {
    setSite(event.target.value);
  };
  const handleCriarClick = async () => {
    try {
      const save = await axios.post(
        `${process.env.REACT_APP_API_URL}task/create/${supervisor}`,
        {
          name: description,
          costCenter: site,
        }
      );
      if (save.data.status === 201) {
        alert("Salvo com sucesso");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("Este site ja possui uma tarefa pendente");
      window.location.reload();
    }
  };

  return (
    <div className="container4">
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress size={80} thickness={5} />
        </div>
      )}
      <h1> </h1>
      <div className="container4">
        <div className="container-fluid">
          <div className="space">
            <div className=""></div>
            <div className="">
              <button className="btn btn-primary mb-3" onClick={openModal}>
                <FontAwesomeIcon icon={faPlus} /> Adicionar agendamento
              </button>
            </div>
          </div>
          {!isLoading && scheduleList.length === 0 && (
            <div
              style={{ textAlign: "center", color: "black", padding: "20px" }}
            >
              Nenhum dado disponível, este cliente ainda não possui Sites
            </div>
          )}

          {!isLoading && scheduleList.length > 0 && (
            <>
              <div className="container4">
                <DataGrid
                  rows={scheduleList
                    .slice(
                      pageNumber * schedulePerPage,
                      pageNumber * schedulePerPage + schedulePerPage
                    )
                    .map((schedule, index) => ({
                      ...schedule,
                      id: `${schedule.name}_${schedule.supervisorCode}_${schedule.state}_${index}`,
                    }))}
                  columns={[
                    { field: "id", headerName: "ID", width: 60 },
                    {
                      field: "name",
                      headerName: "Tarefa designada",
                      width: 200,
                    },
                    {
                      field: "costCenter",
                      headerName: "Centro de custo",
                      width: 200,
                    },
                    {
                      field: "supervisorCode",
                      headerName: "Supervisor",
                      width: 200,
                    },
                    { field: "state", headerName: "Estado", width: 200 },
                    {
                      field: "actions",
                      headerName: "Ações",
                      width: 150,
                      renderCell: (params) => (
                        <div>
                          <button
                            className="btn btn-primary btn-sm mr-2 mb-4"
                            onClick={() => handleOpenEditModal(params.row)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm mb-4"
                            onClick={() => handleDelete(params.row.idSite)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ),
                    },
                  ]}
                  pageSize={schedulePerPage}
                  rowCount={scheduleList.length}
                  pagination
                  onPageChange={handlePageChange}
                  onSelectionModelChange={(newSelection) => {
                    setSelectedSchedule(newSelection[0]);
                  }}
                />
              </div>
            </>
          )}
          <Modal open={isModalOpen} onClose={closeModal}>
            <div
              className="modal-container4"
              style={{ maxWidth: "400px", width: "80%", margin: "auto" }}
            >
              <h3>Novo agendamento</h3>
              <div className="row">
                <div className="col-md-12">
                  <div>
                    <label>Descrição</label>
                    <input
                      type="text"
                      className="form-control"
                      value={description}
                      onChange={handleDescriptionChange}
                    />
                  </div>
                  <div>
                    <label>Supervisor</label>
                    <select
                      className="form-control"
                      value={supervisor}
                      onChange={handleSupervisorChange}
                    >
                      <option value="" disabled>
                        ----Selecione um supervisor-----
                      </option>
                      {supervisorList.map((opcao, index) => (
                        <option required key={index} value={opcao.employeeId}>
                          {opcao.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Site</label>
                    <select
                      className="form-control"
                      value={site}
                      onChange={handleSiteChange}
                    >
                      <option value="" disabled>
                        ----Selecione um site-----
                      </option>
                      {siteListFilter.map((opcao, index) => (
                        <option required key={index} value={opcao.costCenter}>
                          {opcao.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button
                      className="btn btn-success form-control"
                      onClick={handleCriarClick}
                    >
                      Criar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default ScheduleList;
