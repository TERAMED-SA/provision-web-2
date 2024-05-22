import React, { useEffect, useState } from "react";
import axios from "axios";
import customMarkerIcon from "../assets/logo.png";
import "./Map.css";
import CircularProgress from "@mui/material/CircularProgress";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../components/calendar/Calendar.css'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const MapComponent = () => {
  const [users, setUsers] = useState([]);
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [usersMap, setUsersMap] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [selectedButton, setSelectedButton] = useState(2);

  const [markers, setMarkers] = useState([]);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);


  const handleDateChange = (date) => {
    setStartDate(date);
  };

  const handleButtonSelect = (buttonId) => {
    setSelectedButton(buttonId);
  };
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

      const newMap = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: luandaCoords,
          zoom: 9,
        }
      );
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
        userTime.setHours(userTime.getHours()); // Adiciona uma hora ao objeto Date

        const formattedTime = userTime.toLocaleString();

        function convertToDate(dateString) {
          const [datePart, timePart] = dateString.split(", ");
          const [day, month, year] = datePart.split("/");
          const [hours, minutes, seconds] = timePart.split(":");
          return new Date(year, month - 1, day, hours, minutes, seconds);
        }

        // Supondo que você tenha `user` e `formattedTime` disponíveis no seu contexto
        const currentTime = new Date();
        const formattedTimeDate = convertToDate(formattedTime);
        const fiveMinutesInMilliseconds = 5 * 60 * 1000;
        const isOnline =
          currentTime - formattedTimeDate <= fiveMinutesInMilliseconds;

        marker.addListener("click", () => {
          infoWindow.setContent(`
              <div class="popup-content">
                <img src="/avatar2.png" alt="Foto de ${user.name}" />
                <div class="popup-text">
                  <h6>Nome: ${user.name}</h6>
                  <h6>Mecanográfio: ${user.userId}</h6>
                  ${isOnline
              ? "<p>Online agora</p>"
              : `<p>Última atividade: ${formattedTime}</p>`
            }
                </div>
               </div>
`);
          infoWindow.open(map, marker);
        });
      });
    }
  }, [users, map, infoWindow]);


  //Aqui vai ficar as cenas da do historico da geo 

  async function handleUserSelection(user) {
    setSelectedUser(user);
    await fetchGeo(user.employeeId);

  }

  function clearRoute() {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }
  }

  function addMarker(locationLat, locationLng, title, employeeId) {
    const marker = new window.google.maps.Marker({
      position: { lat: locationLat, lng: locationLng },
      title: title,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    return { marker, employeeId };
  }


  async function showRoute() {
    clearRoute();
    await fetchGeo(selectedUser.employeeId);

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

    // Adiciona marcadores nos pontos de localização
    waypoints.forEach((waypoint, index) => {
      const marker = new window.google.maps.Marker({
        position: waypoint.location,
        map: map,
        label: (index + 1).toString(), // Números sequenciais para os marcadores
      });
    });

    // Adiciona setas entre os pontos
    for (let i = 0; i < waypoints.length - 1; i++) {
      const origin = waypoints[i].location;
      const destination = waypoints[i + 1].location;
      const arrowSymbol = {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      };
      const line = new window.google.maps.Polyline({
        path: [origin, destination],
        icons: [{
          icon: arrowSymbol,
          offset: '100%'
        }],
        map: map,
      });
    }
  }

  async function fetchGeo(id) {
    try {

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}geoLocation/findUserGeo/${id}?day=${startDate.getDate()}&month=${startDate.getMonth() + 1}&year=${startDate.getFullYear()}`
      )
      console.log(response.data.data);
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
      //setStateButton(false);
      setMarkers(newMarkers);
    } catch (error) {
      console.error("Erro ao buscar dados de localização:", error.message);
    }
  }


  // function handleUpdateRoute() {
  //   if (!selectedUser || !day || !month || !year) {
  //     toast.error("Selecione um usuário e insira uma data válida.");
  //     return;
  //   }

  //   clearRoute();
  //   fetchGeo(selectedUser.employeeId);
  // }

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
            <div style={{ overflow: "auto", maxHeight: "120px" }}>
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

          {/* <CalendarInfo /> */}
          <div className="calendar-container">
            <div className="buttons-container">
              <button
                className={`custom-button blue-button ${selectedButton === 1 ? "selected" : ""}`}
                onClick={() => handleButtonSelect(1)}
              >
                HISTÓRICO
              </button>
              <button
                className={`custom-button green-button ${selectedButton === 2 ? "selected" : ""}`}
                onClick={() => handleButtonSelect(2)}
              >
                ONLINE
              </button>
            </div>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              inline
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
            {/* <div className="date-info">
                <p>Dia: {startDate.getDate()}</p>
                <p>Mês: {startDate.getMonth() + 1}</p>
                <p>Ano: {startDate.getFullYear()}</p>
              </div> */}
            <div className="additional-button-container">
              <button className="custom-button orange-button"
                onClick={showRoute}
              >ACTUALIZAR</button>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div id="map" style={{ height: "80vh" }}></div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
