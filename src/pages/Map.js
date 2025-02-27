import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Map.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import customMarkerIcon from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [markers, setMarkers] = useState([]);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stateButton, setStateButton] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [infoWindow, setInfoWindow] = useState(null);
  const navigate = useNavigate();
  //Essas vaiaveis sao para a modal
  useEffect(() => {
    const luandaCoords = { lat: -8.8368, lng: 13.2343 }; // Coordenadas para Mutamba, Luanda
    const googleMap = new window.google.maps.Map(mapContainerRef.current, {
      center: luandaCoords,
      zoom: 14,
    });
    setMap(googleMap);
    setInfoWindow(new window.google.maps.InfoWindow());
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'https://provision-07c1.onrender.com/api/v1/admin/metrics?size=10&page=1'
      );
      if (response.data?.data?.sites) {
        // Extract unique supervisors from sites
        const supervisors = response.data.data.sites
          .filter(site => site.supervisor) // Remove null supervisors
          .map(site => ({
            name: site.supervisor.name,
            employeeId: site.supervisor.employeeId
          }))
          .filter((supervisor, index, self) => 
            // Remove duplicates based on employeeId
            index === self.findIndex(s => s.employeeId === supervisor.employeeId)
          );
        setUsers(supervisors);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Erro:", error.message);
      setIsLoading(false);
    }
  }
  
  
  async function fetchGeo(id) {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }geoLocation/findUserGeo/${id}?day=${startDate.getDate()}&month=${
          startDate.getMonth() + 1
        }&year=${startDate.getFullYear()}`
      );

      if (response.data.data.length === 0) {
        toast.error(
          "Não há dados de geolocalização disponíveis para este usuário."
        );
        return;
      }

      const newMarkers = response.data.data
        .map((markerData) => {
          if (markerData.route && typeof markerData.route === "object") {
            return Object.values(markerData.route).map((location) => {
              if (location.lat && location.lng) {
                return addMarker(
                  location.lat,
                  location.lng,
                  markerData.name,
                  markerData.userId
                );
              }
              return null; // Return null if location is invalid
            });
          }
          return null; // Return null if markerData has no route object
        })
        .flat() // Flatten the array of arrays
        .filter(Boolean); // Filter out any null values
      toast.info(
        "Existem registros disponíveis para o utilizador selecionado."
      );

      setStateButton(false);
      setMarkers(newMarkers);
    } catch (error) {
      console.error("Erro ao buscar dados de localização:", error.message);
    }
  }
  useEffect(() => {
    clearRoute();
    if (selectedUser) {
      fetchGeo(selectedUser.employeeId);
    }
  }, [selectedUser]);

  function addMarker(locationLat, locationLng, title, employeeId) {
    const marker = new window.google.maps.Marker({
      position: { lat: locationLat, lng: locationLng },
      title: title,
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div><h3>chrisalberto</h3><p>${title}</p></div>`,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    return { marker, employeeId };
  }

  async function showRoute() {
    clearRoute();
    if (!selectedUser) {
      toast.error("Selecione um usuário.");
      setStateButton(true);
      return;
    }
    if (!selectedUser || !map || !markers.length) {
      toast.error(
        "Nenhuma rota está disponível para este supervisor na data selecionada."
      );
      return;
    }
    const userMarkers = markers.filter(
      (marker) => marker.employeeId === selectedUser.employeeId
    );
    if (userMarkers.length === 0) {
      toast.error("Não há rota disponível para este supervisor.");
      return;
    }
    const waypoints = userMarkers.map((marker) => ({
      location: marker.marker.getPosition(),
    }));

    const request = {
      origin: waypoints[0].location,
      destination: waypoints[waypoints.length - 1].location,
      waypoints: waypoints.slice(1, -1),
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        const route = new window.google.maps.DirectionsRenderer({
          directions: result,
          map: map,
        });
        setDirectionsRenderer(route);
      } else {
        console.error("Erro ao calcular a rota:", status);
      }
    });
  }

  function clearRoute() {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }
  }

  function handleUserSelection(user) {
    setSelectedUser(user);
    setStateButton(true);
    clearRoute();
  }

  const handleDateChange = (date) => {
    setStartDate(date);
  };

  // const handleButtonSelect = (buttonId) => {
  //   setSelectedButton(buttonId);
  // };

  function handleUpdateRoute() {
    if (!selectedUser) {
      toast.error("Selecione um supervisor.");
      setStateButton(true);
      return;
    }
    // clearMarkers()
    clearRoute();
    fetchGeo(selectedUser.employeeId);
  }
  async function clearMarkers() {
    // Remove todos os marcadores do mapa
    usersMap.forEach((user) => {
      user.marker.setMap(null); // Define o mapa do marcador como nulo para removê-lo
    });
    usersMap = []; // Limpa o array de usuários do mapa
  }
  async function fetchDataUsersMap() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}geolocation/findAllUserLastPosition`
      );
      if (response.data && Array.isArray(response.data.data)) {
        setUsersMap(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao buscar as últimas localizações:", error.message);
    }
  }

  const openModalOnlineUsers = async () => {
    navigate("/mapOnline");
  };
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container4">
      <h1 style={{ textAlign: "center" }}>
        ROTA DOS SUPERVISORES <span className="badge badge-secondary"></span>
      </h1>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        / <span>Rotas</span>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              <div className="mt-4">
                <h2>Supervisores</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar supervisores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {isLoading && (
                  <div className="text-center mt-4">
                    <CircularProgress size={80} thickness={5} />
                  </div>
                )}

                {!isLoading && users.length === 0 && (
                  <div className="text-center text-black mt-4">
                    Nenhum dado disponível
                  </div>
                )}

                {!isLoading && users.length > 0 && (
                  <div style={{ overflow: "auto", maxHeight: "120px" }}>
                    <ul className="list-unstyled">
                      {filteredUsers.map((user) => (
                        <li key={user.employeeId}>
                          <label className="form-check-label">
                            <input
                              className="form-check-input"
                              type="radio"
                              checked={
                                selectedUser &&
                                selectedUser.employeeId === user.employeeId
                              }
                              onChange={() => handleUserSelection(user)}
                            />
                            {user.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <button
                      className="btn btn-danger me-2 btn-lg form-control"
                      onClick={openModalOnlineUsers}
                    >
                      Online
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn btn-success btn-lg form-control"
                      onClick={showRoute}
                      disabled={stateButton}
                    >
                      Mostrar Rota
                    </button>
                  </div>
                </div>

                <div className="calendar-container">
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    inline
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              </div>
              <div className="col-md-12">
                <button
                  className="btn btn-primary btn-lg form-control"
                  onClick={handleUpdateRoute}
                >
                  Atualizar Rota
                </button>
              </div>
            </div>

            <div className="col-md-8">
              <div
                ref={mapContainerRef}
                style={{ height: "80vh", width: "100%", marginTop: "20px" }}
              ></div>
            </div>
          </div>

          <ToastContainer />
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default MapComponent;
