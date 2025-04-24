/* eslint-disable no-lone-blocks */

import { MdMenu } from "react-icons/md";
import "./Navbar.css";

import React from "react";

const Navbar = ({ sidebarOpen, openSidebar }) => {
  return (
    <nav className="navbar navbar-expand-lg ">
      <div className="container-fluid">
        <div className="nav_icon" onClick={() => openSidebar()}>
          <i className="open_sider_icon" aria-hidden="true">
            <MdMenu />
          </i>
        </div>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              {/*  <div style={{ display: 'flex', flexDirection: "row" }}>
              
                <input placeholder="Pesquisar..." className="form-control" style={{ borderRadius: '40px' }} />
              </div>
              {/* lista com 3 topologias 
                                  depois de escolher a topologia  
                                                vemos o numero de serie
                                                qr code 
                                                
                                                verificar os funcionarios apartir de uma lista
                                                e o nome aparece automaticamente
                                                
                                                editar o registo 
                                                */}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
