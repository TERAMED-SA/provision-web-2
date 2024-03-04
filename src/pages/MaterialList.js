import React, { useState } from "react";
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
import "./MaterialList.css";

const MaterialList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialRating, setMaterialRating] = useState("");

  const generateRandomRating = () => {
    const ratings = ["Excelente", "Bom", "Regular", "Péssimo"];
    const randomIndex = Math.floor(Math.random() * ratings.length);
    return ratings[randomIndex];
  };

  const generateRandomMaterial = (id) => {
    return {
      id,
      name: `Material ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      quantity: Math.floor(Math.random() * 20) + 1,
      rating: generateRandomRating(),
    };
  };

  const [materialList, setMaterialList] = useState(
    Array.from({ length: 50 }, (_, index) => generateRandomMaterial(index + 1))
  );

  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [pageNumber, setPageNumber] = useState(0);
  const materialPerPage = 5;
  const pagesVisited = pageNumber * materialPerPage;

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMaterialName("");
    setMaterialQuantity("");
    setMaterialRating("");
  };

  const handleAddMaterial = () => {
    const newMaterial = generateRandomMaterial(materialList.length + 1);
    setMaterialList([...materialList, newMaterial]);
    closeModal();
  };

  const handleEditMaterial = (materialId) => {
    setEditingMaterialId(materialId);
    const materialToEdit = materialList.find(
      (material) => material.id === materialId
    );
    setEditedMaterial(materialToEdit);
    setIsEditModalOpen(true);
  };

  const handleSaveMaterial = () => {
    const updatedMaterialList = materialList.map((material) =>
      material.id === editingMaterialId ? editedMaterial : material
    );
    setMaterialList(updatedMaterialList);
    setIsEditModalOpen(false);
    setEditingMaterialId(null);
  };

  const handleDeleteMaterial = (materialId) => {
    const updatedMaterialList = materialList.filter(
      (material) => material.id !== materialId
    );
    setMaterialList(updatedMaterialList);
  };

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <div className="container4">
      <div className="space">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1> </h1>
          <div className="mt-4">
          <button
              className="btn btn-primary btn-add-company"
              onClick={openModal}
            >
              <FontAwesomeIcon icon={faPlus} /> Adicionar Usuário
            </button>
          </div>
        </div>
      </div>
      <DataGrid
        rows={materialList
          .slice(pagesVisited, pagesVisited + materialPerPage)
          .map((material) => ({
            ...material,
          }))}
        columns={[
          { field: "id", headerName: "ID", width: 60 },
          { field: "name", headerName: "Nome do Material", width: 200 },
          { field: "quantity", headerName: "Quantidade", width: 150 },
          { field: "rating", headerName: "Avaliação", width: 150 },
          {
            field: "actions",
            headerName: "Ações",
            width: 150,
            renderCell: (params) => (
              <div className="central">
                <button
                  className="btn btn-warning"
                  onClick={() => handleEditMaterial(params.row.id)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteMaterial(params.row.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ),
          },
        ]}
        pageSize={materialPerPage}
        pagination
        onPageChange={handlePageChange}
        rowCount={materialList.length}
      />


      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Adicionar Material"
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>Adicionar Material</h2>

        <div className="form-group">
          <label htmlFor="materialName" className="text-modal">
            Nome do Material
          </label>
          <input
            type="text"
            id="materialName"
            className="form-control"
            placeholder="Nome do Material"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="materialQuantity" className="text-modal">
            Quantidade
          </label>
          <input
            type="text"
            id="materialQuantity"
            className="form-control"
            placeholder="Quantidade"
            value={materialQuantity}
            onChange={(e) => setMaterialQuantity(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <div className="form-group">
            <label htmlFor="editedMaterialRating" className="text-modal">
              Avaliação
            </label>
            <select
              id="editedMaterialRating"
              className="form-control"
              value={materialRating || "Excelente"} // Use "Excelente" como padrão
              onChange={(e) => setMaterialRating(e.target.value)}
            >
              <option value="Excelente">Excelente</option>
              <option value="Bom">Bom</option>
              <option value="Regular">Regular</option>
              <option value="Péssimo">Péssimo</option>
            </select>
          </div>
        </div>

        <button className="btn btn-success" onClick={handleAddMaterial}>
          Adicionar
        </button>
        <button className="btn btn-danger" onClick={closeModal}>
          Fechar
        </button>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Editar Material"
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>Editar Material</h2>

        <div className="form-group">
          <label htmlFor="editedMaterialName" className="text-modal">
            Nome do Material
          </label>
          <input
            type="text"
            id="editedMaterialName"
            className="form-control"
            placeholder="Nome do Material"
            value={editedMaterial.name || ""}
            onChange={(e) =>
              setEditedMaterial({
                ...editedMaterial,
                name: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="editedMaterialQuantity" className="text-modal">
            Quantidade
          </label>
          <input
            type="text"
            id="editedMaterialQuantity"
            className="form-control"
            placeholder="Quantidade"
            value={editedMaterial.quantity || ""}
            onChange={(e) =>
              setEditedMaterial({
                ...editedMaterial,
                quantity: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <div className="form-group">
            <label htmlFor="editedMaterialRating" className="text-modal">
              Avaliação
            </label>
            <select
              id="editedMaterialRating"
              className="form-control"
              value={editedMaterial.rating || "Excelente"} // Use "Excelente" como padrão
              onChange={(e) =>
                setEditedMaterial({
                  ...editedMaterial,
                  rating: e.target.value,
                })
              }
            >
              <option value="Excelente">Excelente</option>
              <option value="Bom">Bom</option>
              <option value="Regular">Regular</option>
              <option value="Péssimo">Péssimo</option>
            </select>
          </div>
        </div>

        <button className="btn btn-success" onClick={handleSaveMaterial}>
          <FontAwesomeIcon icon={faSave} /> Salvar
        </button>
        <button
          className="btn btn-danger"
          onClick={() => setIsEditModalOpen(false)}
        >
          <FontAwesomeIcon icon={faTimes} /> Fechar
        </button>
      </Modal>
    </div>
  );
};

export default MaterialList;
