/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./Home/Login";
import UserList from "./pages/UserList";
import CompanyList from "./pages/CompanyList";
import SiteList from "./pages/SiteList";
import Map from "./pages/Map";
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
import Pusher from "pusher-js";
import { ToastContainer, toast } from "react-toastify";
import { appFirebase } from "./firebase";
import Occurrence from "./pages/occurrence";
import Report from "./pages/report";
import NewSupervision from "./pages/newSupervision";
import Team from "./pages/team";
import "./App.css";
import "./Style.css";

import "bootstrap-icons/font/bootstrap-icons.css";
import MapOnlineComponent from "./pages/mapOnline";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {

    // appFirebase()

    const pusher = new Pusher(`${process.env.REACT_APP_KEY}`, {
      cluster: `${process.env.REACT_APP_CLUSTER}`,
      encrypted: true,
    });

    const channel = pusher.subscribe("my-channel");

    channel.bind("newSupervision", (data) => {
      toast.info("Recebeu uma nova supervisão. Por favor, consulte as notificações.")
    });


    channel.bind("newOccurrence", (data) => {
      toast.info("Recebeu uma nova ocorrência, por favor actualize consultar as notificações")
    });

    return () => {
      pusher.unsubscribe("my-channel");
    };
  }, [])

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
            <Route path="/Map" element={<Map />} />
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
            <Route path="/Report" element={<Report />} />
            <Route path="/newsupervision" element={<NewSupervision />} />
            <Route path="/occurrence" element={<Occurrence />} />
            <Route path="/Notification" element={<Notification />} />
            <Route path="/mapOnline" element={<MapOnlineComponent />} />
            <Route path="/team" element={<Team />} />
            <Route
              path="/Companies"
              element={<Companies handleItemClick={navigateToManagementList} />}
            />
          </Routes>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
