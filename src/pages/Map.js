import React, { useEffect, useState } from "react";
import axios from "axios";
import customMarkerIcon from "../assets/logo.png"
import './Map.css'
import CircularProgress from "@mui/material/CircularProgress";
import CalendarInfo from "../components/calendar/Calendar";
const MapComponent = () => {
  const [users, setUsers] = useState([]);
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [usersMap, setUsersMap] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  async function fetchUsers() {
    try {
      const userCoord = localStorage.getItem("userId");
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user/findBelongsToMe/${userCoord}?size=50`
      );
      if (response.data && Array.isArray(response.data.data)) {
        setUsersMap(response.data.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Erro:", error.message);
      setIsLoading(false);
    }
  }
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}geolocation/findAllUserLastPosition`
        );
        if (response.data && Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Erro ao buscar últimas localizações:", error.message);
      }
    }

    fetchData();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && !map) {
      const luandaCoords = { lat: -8.8368, lng: 13.2343 }; // Coordenadas para Mutamba, Luanda

      const newMap = new window.google.maps.Map(document.getElementById("map"), {
        center: luandaCoords,
        zoom: 9,
      });
      setMap(newMap);
      setInfoWindow(new window.google.maps.InfoWindow());
    }

    if (map) {
      users.forEach((user) => {

        const icon = {
          url: customMarkerIcon,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(15, 30),
        };

        const marker = new window.google.maps.Marker({
          position: { lat: user.lat, lng: user.lng },
          map: map,
          title: user.userId,
          icon: icon,
        });

        const userTime = new Date(user.time); // Converte a hora do usuário para um objeto Date
        userTime.setHours(userTime.getHours() + 1); // Adiciona uma hora ao objeto Date

        const formattedTime = userTime.toLocaleString();

        marker.addListener("click", () => {
          infoWindow.setContent(`
            <div class="popup-content">
              <img src="/avatar2.png" alt="Foto de ${user.name}" />
              <div class="popup-text">
                <h6>Nome: ${user.name}</h6>
                <h6>Mecanográfio: ${user.userId}</h6>
                <p>Última atividade: ${formattedTime}</p>
              </div>
            </div>
        `);
          infoWindow.open(map, marker);
        });
      });
    }
  }, [users, map, infoWindow]);

  function handleUserSelection(user) {
    setSelectedUser(user);
    //setStateButton(true);
    // clearRoute();
    return
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
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
                {usersMap.map((user) => (
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
          <div>
            <CalendarInfo />
          </div>
        </div>
        <div className="col-md-8">
          <div id="map" style={{ height: "80vh" }}></div>
        </div>
      </div>
    </div>
  )
};

export default MapComponent;
