/* eslint-disable no-lone-blocks */

import { MdMenu } from "react-icons/md";
import "./Navbar.css";

import React from "react";

const Navbar = ({ sidebarOpen, openSidebar }) => {
  {/*Toggle*/ }
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
              <div style={{ display: 'flex', flexDirection: "row" }}>
                {/*<ImSearch />*/}
                <input placeholder="Pesquisar..." className="form-control" style={{ borderRadius: '40px' }} />
              </div>


            </li>
          </ul>
        </div>
      </div>
    </nav>
  );


}
export default Navbar;
