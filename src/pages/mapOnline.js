import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import { Link } from "react-router-dom";

const MapOnlineComponent = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [usersMap, setUsersMap] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Função para buscar dados dos usuários
  const fetchDataUsersMap = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}geolocation/findAllUserLastPosition`
      );
      if (response.data && Array.isArray(response.data.data)) {
        setUsersMap(response.data.data);
        setFilteredUsers(response.data.data); // Inicialmente, todos os usuários são exibidos
      }
    } catch (error) {
      console.error("Erro ao buscar últimas localizações:", error.message);
    }
  };

  // useEffect para inicializar o mapa
  useEffect(() => {
    const luandaCoords = { lat: -8.8368, lng: 13.2343 }; // Coordenadas para Mutamba, Luanda
    const googleMap = new window.google.maps.Map(mapContainerRef.current, {
      center: luandaCoords,
      zoom: 14,
    });
    setMap(googleMap);
  }, []);

  // useEffect para buscar dados dos usuários quando o componente for montado
  useEffect(() => {
    fetchDataUsersMap();
  }, []);

  // useEffect para adicionar marcadores ao mapa quando o mapa e os dados dos usuários estiverem disponíveis
  useEffect(() => {
    if (map && filteredUsers.length > 0) {
      // Limpa os marcadores anteriores
      if (window.markers) {
        window.markers.forEach((marker) => marker.setMap(null));
      }
      window.markers = [];

      filteredUsers.forEach((user) => {
        const icon = {
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(15, 30),
        };
        const marker = new window.google.maps.Marker({
          position: { lat: user.lat, lng: user.lng },
          map: map,
          title: user.userId,
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

        const currentTime = new Date();
        const formattedTimeDate = convertToDate(formattedTime);
        const fiveMinutesInMilliseconds = 5 * 60 * 1000;
        const isOnline =
          currentTime - formattedTimeDate <= fiveMinutesInMilliseconds;

        // Cria um InfoWindow para cada marcador
        const infoWindow = new window.google.maps.InfoWindow();
        // Conteúdo do popup (nome e estado)
        const popupContent = `
          <div class="popup-content">
            <div class="popup-text">
              <h6>Nome: ${user.name} </h6>
              <p> ${
                isOnline
                  ? "<h6>Online agora</h6>"
                  : `<h6>Última atividade: ${formattedTime}</h6>`
              } </p>
            </div>
          </div>
        `;
        // Abre o infoWindow automaticamente com o conteúdo (nome e estado)
        infoWindow.setContent(popupContent);
        infoWindow.open(map, marker);

        // Adiciona o marcador ao array de marcadores
        window.markers.push(marker);
      });
    }
  }, [map, filteredUsers]);

  // Função para filtrar usuários com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm.trim().length >= 7) {
      const filtered = usersMap.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else if (searchTerm.trim() === "") {
      // Se o input estiver vazio, mostra todos os usuários
      setFilteredUsers(usersMap);
    }
  }, [searchTerm, usersMap]);

  // Atualiza o termo de pesquisa
  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <h1 style={{ textAlign: "center" }}>
        SUPERVISORES ONLINE <span className="badge badge-secondary"></span>
      </h1>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        /{" "}
        <Link to="/Map" className="p-1">
          Rota
        </Link>{" "}
        / <span>Supervisores Online</span>
        <br></br>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Pesquisar supervisor..."
            value={searchTerm}
            onChange={handleInputChange} // Atualiza o termo de pesquisa
            className="form-control"
            style={{ paddingLeft: "1rem", width: "100%" }} // Estilo personalizado
          />
        </div>
        <div
          ref={mapContainerRef}
          style={{ height: "80vh", width: "100%", marginTop: "20px" }}
        ></div>
      </div>
    </div>
  );
};

export default MapOnlineComponent;
