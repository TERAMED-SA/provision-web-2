import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { DataGrid } from "@mui/x-data-grid";

import "bootstrap/dist/css/bootstrap.min.css";
import "./CompanyList.css";
import axios from "axios";

function CompanyList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyNif, setCompanyNif] = useState("");

  const [companyList, setCompanyList] = useState([]);

  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [editedCompany, setEditedCompany] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [pageNumber, setPageNumber] = useState(0);
  const companiesPerPage = 5;

  async function fetchCompanies() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}company`
      );
      setCompanyList(response.data.data.data);
    } catch (error) {
      console.error("Erro:", error.message);
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCompanyName("");
    setCompanyNif("");
  };

  const handleAddCompany = async () => {
    try {
      const newCompany = {
        name: companyName,
        nif: companyNif,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}company`,
        newCompany
      );

      setCompanyList([...companyList, response.data.data]);
      closeModal();
    } catch (error) {
      console.error("Erro ao adicionar empresa:", error.message);
    }
  };

  const handleEditCompany = async (companyId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}company/${companyId}`
      );
      setEditedCompany(response.data.data);
      setEditingCompanyId(companyId);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Erro ao editar empresa:", error.message);
    }
  };

  const handleSaveCompany = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}company/${editingCompanyId}`,
        editedCompany
      );

      const updatedCompanyList = companyList.map((company) =>
        company._id === editingCompanyId ? response.data.data : company
      );
      setCompanyList(updatedCompanyList);
      setIsEditModalOpen(false);
      setEditingCompanyId(null);
      setEditedCompany({});
    } catch (error) {
      console.error("Erro ao salvar empresa:", error.message);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}company/${companyId}`
      );
      const updatedCompanyList = companyList.filter(
        (company) => company._id !== companyId
      );
      setCompanyList(updatedCompanyList);
    } catch (error) {
      console.error("Erro ao excluir empresa:", error.message);
    }
  };

  return (
    <div className="container4">
      <div className="space">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1> </h1>
          <div className="mt-4">
            <button className="btn btn-primary" onClick={openModal}>
              <FontAwesomeIcon icon={faPlus} /> Adicionar Empresa
            </button>
          </div>
        </div>
      </div>
      <DataGrid
        rows={
          Array.isArray(companyList)
            ? companyList
                .slice(
                  pageNumber * companiesPerPage,
                  pageNumber * companiesPerPage + companiesPerPage
                )
                .map((company, index) => ({
                  id: index + 1,
                  name: company.name || "",
                  nif: company.nif || "",
                  idUser: company._id,
                }))
            : []
        }
        columns={[
          { field: "id", headerName: "ID", width: 60 },
          { field: "name", headerName: "Nome", width: 200 },
          { field: "nif", headerName: "NIF", width: 200 },
          {
            field: "actions",
            headerName: "Ações",
            width: 150,
            renderCell: (params) => (
              <div className="central">
                <button
                  className="btn btn"
                  onClick={() => handleEditCompany(params.row.idUser)}
                  disabled={editingCompanyId === params.row.idUser}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className="btn btn"
                  onClick={() => handleDeleteCompany(params.row.idUser)}
                  disabled={editingCompanyId === params.row.idUser}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ),
          },
        ]}
        pageSize={companiesPerPage}
        rowCount={companyList.length}
        pagination
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Adicionar Empresa"
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <div className="form-group">
          <input
            type="text"
            id="companyName"
            className="form-control"
            placeholder="Nome da Empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            id="companyNif"
            className="form-control"
            placeholder="NIF"
            value={companyNif}
            onChange={(e) => setCompanyNif(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleAddCompany}>
          Adicionar
        </button>
        <button className="btn btn-danger" onClick={closeModal}>
          Fechar
        </button>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => {
          setIsEditModalOpen(false);
          setEditingCompanyId(null);
          setEditedCompany({});
        }}
        contentLabel="Editar Empresa"
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <div className="form-group">
          <input
            type="text"
            id="editedCompanyName"
            className="form-control"
            placeholder="Nome da Empresa"
            value={editedCompany.name || ""}
            onChange={(e) =>
              setEditedCompany({
                ...editedCompany,
                name: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            id="editedCompanyNif"
            className="form-control"
            placeholder="NIF"
            value={editedCompany.nif || ""}
            onChange={(e) =>
              setEditedCompany({
                ...editedCompany,
                nif: e.target.value,
              })
            }
          />
        </div>

        <button className="btn btn-success" onClick={handleSaveCompany}>
          <FontAwesomeIcon icon={faSave} className="mr-2" />
          Salvar
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingCompanyId(null);
            setEditedCompany({});
          }}
        >
          <FontAwesomeIcon icon={faTimes} className="mr-2" />
          Fechar
        </button>
      </Modal>
    </div>
  );
}

export default CompanyList;
