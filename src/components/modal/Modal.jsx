import React from 'react';
import './modal.css';

class Modal extends React.Component {
  render() {
    const { isOpen, onClose, children } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <span className="modal-close" onClick={onClose}>&times;</span>
          {children}
        </div>
      </div>
    );
  }
}

export default Modal;

