import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Supervision = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [markers, setMarkers] = useState([]);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [stateButton, setStateButton] = useState(true);
  useEffect(() => {
    const luandaCoords = { lat: -8.8368, lng: 13.2343 }; // Coordenadas para Mutamba, Luanda
    const googleMap = new window.google.maps.Map(mapContainerRef.current, {
      center: luandaCoords,
      zoom: 14,
    });
    setMap(googleMap);
    fetchUsers();
    setDay(date.getDate());
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  }, []);

  async function fetchUsers() {
    try {
      const userCoord = localStorage.getItem("userId");
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user/findBelongsToMe/${userCoord}?size=50`
      );
      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
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
        `${process.env.REACT_APP_API_URL}geoLocation/findUserGeo/${id}?day=${day}&month=${month}&year=${year}`
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
    if (!selectedUser || !map || !markers.length) {
      toast.error("Não há rota disponível para este usuário.");
      return;
    }
    const userMarkers = markers.filter(
      (marker) => marker.employeeId === selectedUser.employeeId
    );
    if (userMarkers.length === 0) {
      toast.error("Não há rota disponível para este usuário.");
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
  function handleDay(day) {
    setDay(day);
  }
  function handleMonth(month) {
    setMonth(month);
  }
  function handleYear(year) {
    setYear(year);
  }

  function handleUpdateRoute() {
    if (!selectedUser || !day || !month || !year) {
      toast.error("Selecione um usuário e insira uma data válida.");
      setStateButton(true);
      return;
    }

    clearRoute();
    fetchGeo(selectedUser.employeeId);
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <div className="mt-4">
            <h2>Utilizadores</h2>
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
              <div style={{ overflow: "auto", maxHeight: "200px" }}>
                <ul className="list-unstyled">
                  {users.map((user) => (
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
                  onClick={clearRoute}
                >
                  Ocultar Rota
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

            <div className="row mt-3">
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control custom-input"
                  placeholder="Dia"
                  min={1}
                  max={31}
                  onChange={({ target: { value } }) => handleDay(value)}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control custom-input"
                  placeholder="Mês"
                  min={1}
                  max={12}
                  onChange={({ target: { value } }) => handleMonth(value)}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control custom-input"
                  placeholder="Ano"
                  min={2000}
                  max={2050}
                  onChange={({ target: { value } }) => handleYear(value)}
                />
              </div>
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
    </div>
  );
};

export default Supervision;
