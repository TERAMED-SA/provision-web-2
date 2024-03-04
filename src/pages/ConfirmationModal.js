import React from 'react';
import './ConfirmationModal.css';


const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-background">
      <div className="modal-content">
        <h3>Confirmação</h3>
        <p>Deseja realmente excluir este usuário?</p>
        <div className="modal-buttons">
          <button className="btn btn-danger" onClick={onConfirm}>Confirmar</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
