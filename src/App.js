/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./Home/Login";
import UserList from "./pages/UserList";
import CompanyList from "./pages/CompanyList";
import SiteList from "./pages/SiteList";
import Supervision from "./pages/Supervision";
import EquipmentList from "./pages/EquipmentList";
import MaterialList from "./pages/MaterialList";
import ManagementList from "./pages/ManagementList";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import EmployeeList from "./pages/EmployeeList";
import InventoryList from "./pages/InventoryList";
import ScheduleList from "./pages/ScheduleList";
import HistoryList from "./pages/HistoryList";
import Chat from "./chat/Chat";
import Companies from "./pages/Companies";
import Notification from "./pages/Notification";

import "./App.css";
import "./Style.css";

import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const openSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateToManagementList = (company) => {
    navigate(`/managementList/${company.title}`);
  };

  const isNonAffectedPage =
    location.pathname.toLowerCase() === "/login" ||
    location.pathname.toLowerCase() === "/register" ||
    location.pathname === "/";

  return (
    <div className={`app-container ${isNonAffectedPage ? "no-sidebar" : ""}`}>
      <div className="d-flex">
        {!isNonAffectedPage && (
          <Sidebar sidebarOpen={sidebarOpen} closeSidebar={closeSidebar} />
        )}
        <div className="col overflow-auto">
          {!isNonAffectedPage && (
            <Navbar sidebarOpen={sidebarOpen} openSidebar={openSidebar} />
          )}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/companylist" element={<CompanyList />} />
            <Route path="/SiteList" element={<SiteList />} />
            <Route path="/Supervision" element={<Supervision />} />
            <Route path="/EquipmentList" element={<EquipmentList />} />
            <Route path="/MaterialList" element={<MaterialList />} />
            <Route path="/ManagementList" element={<ManagementList />} />
            <Route path="/EmployeeList" element={<EmployeeList />} />
            <Route path="/InventoryList" element={<InventoryList />} />
            <Route path="/ScheduleList" element={<ScheduleList />} />
            <Route path="/HistoryList" element={<HistoryList />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/Chat/:userType/:userId" element={<Chat />} />
            <Route path="/Chat/:userId" element={<Chat />} />
            <Route path="/Notification" element={<Notification />} />
            <Route
              path="/Companies"
              element={<Companies handleItemClick={navigateToManagementList} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
