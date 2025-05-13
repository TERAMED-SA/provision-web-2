import React, { useEffect, useRef, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { FcApproval } from "react-icons/fc";
import ReactDOMServer from "react-dom/server";
import { FcSynchronize } from "react-icons/fc";
import {
  FaEye,
  FaEyeSlash,
  FaUserCheck,
  FaUserTimes,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";

const MapOnlineComponent = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [usersMap, setUsersMap] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  const [infoWindows, setInfoWindows] = useState([]);
  const [expandedMarkers, setExpandedMarkers] = useState({});
  const [showCards, setShowCards] = useState(true);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Função para verificar se um usuário está online (15 minutos)
  const isUserOnline = useCallback((user) => {
    if (!user || !user.time) return false;

    const userTime = new Date(user.time);
    userTime.setHours(userTime.getHours());
    const formattedTime = userTime.toLocaleString();

    function convertToDate(dateString) {
      const [datePart, timePart] = dateString.split(", ");
      const [day, month, year] = datePart.split("/");
      const [hours, minutes, seconds] = timePart.split(":");
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    const currentTime = new Date();
    const formattedTimeDate = convertToDate(formattedTime);
    const fifteenMinutesInMilliseconds = 15 * 60 * 1000; // 15 minutos em milissegundos
    return currentTime - formattedTimeDate <= fifteenMinutesInMilliseconds;
  }, []);

  // Função para verificar se um usuário esteve online em uma data específica
  const wasUserOnlineOnDate = useCallback((user, dateString) => {
    if (!user || !user.time || !dateString) return false;

    const userTime = new Date(user.time);
    const selectedDate = new Date(dateString);

    // Comparar apenas ano, mês e dia
    return (
      userTime.getFullYear() === selectedDate.getFullYear() &&
      userTime.getMonth() === selectedDate.getMonth() &&
      userTime.getDate() === selectedDate.getDate()
    );
  }, []);

  // Função para formatar a hora da última atividade
  const formatLastSeen = useCallback((timeString) => {
    if (!timeString) return "Desconhecido";

    const userTime = new Date(timeString);
    userTime.setHours(userTime.getHours());
    return userTime.toLocaleString();
  }, []);

  // Função para limpar todos os marcadores do mapa
  const clearMarkers = useCallback(() => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => {
        if (marker) marker.setMap(null);
      });
      markersRef.current = [];
    }

    if (infoWindowsRef.current.length > 0) {
      infoWindowsRef.current.forEach((infoWindow) => {
        if (infoWindow) infoWindow.close();
      });
      infoWindowsRef.current = [];
    }
  }, []);

  // Função para aplicar todos os filtros
  const applyFilters = useCallback(
    (users, term, onlineOnly, offlineOnly, dateFilter) => {
      if (!users || !Array.isArray(users)) return;

      let result = [...users];

      // Filtro por termo de pesquisa
      if (term && term.trim().length >= 3) {
        result = result.filter(
          (user) =>
            user.name && user.name.toLowerCase().includes(term.toLowerCase())
        );
      }

      // Filtro por estado online/offline
      if (onlineOnly) {
        result = result.filter((user) => isUserOnline(user));
      } else if (offlineOnly) {
        result = result.filter((user) => !isUserOnline(user));
      }

      // Filtro por data
      if (dateFilter) {
        result = result.filter((user) => wasUserOnlineOnDate(user, dateFilter));
      }

      setFilteredUsers(result);
    },
    [isUserOnline, wasUserOnlineOnDate]
  );

  // Função para buscar dados dos usuários
  const fetchDataUsersMap = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}geolocation/findAllUserLastPosition`
      );
      if (response.data && Array.isArray(response.data.data)) {
        setUsersMap(response.data.data);
        applyFilters(
          response.data.data,
          searchTerm,
          showOnlineOnly,
          showOfflineOnly,
          selectedDate
        );
      }
    } catch (error) {
      console.error("Erro ao buscar últimas localizações:", error.message);
    }
  }, [applyFilters, searchTerm, showOnlineOnly, showOfflineOnly, selectedDate]);

  // Função para criar o conteúdo do InfoWindow
  const createInfoWindowContent = useCallback(
    (user, isExpanded) => {
      if (!user) return "";

      const isOnline = isUserOnline(user);
      const formattedTime = formatLastSeen(user.time);

      if (isExpanded) {
        // Conteúdo expandido com status
        return ReactDOMServer.renderToString(
          <div
            className="popup-content"
            style={{ padding: "2px", maxWidth: "160px", cursor: "pointer" }}
          >
            <div className="popup-text" style={{ fontSize: "11px" }}>
              <div
                style={{
                  margin: "0",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name || "Sem nome"}
              </div>
              {isOnline ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "green",
                    fontSize: "10px",
                  }}
                >
                  <FcApproval
                    style={{
                      marginRight: "2px",
                      width: "10px",
                      height: "10px",
                    }}
                  />
                  <span>Online</span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "gray",
                    fontSize: "10px",
                  }}
                >
                  <FcSynchronize
                    style={{
                      marginRight: "2px",
                      width: "10px",
                      height: "10px",
                    }}
                  />
                  <span>Visto: {formattedTime}</span>
                </div>
              )}
            </div>
          </div>
        );
      } else {
        // Conteúdo simples - mostrar status para todos os usuários
        return ReactDOMServer.renderToString(
          <div
            className="popup-content"
            style={{ padding: "2px", maxWidth: "150px", cursor: "pointer" }}
          >
            <div className="popup-text" style={{ fontSize: "16px" }}>
              <div
                style={{
                  margin: "0",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name || "Sem nome"}
              </div>
              {isOnline ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "green",
                    fontSize: "10px",
                  }}
                >
                  <FcApproval
                    style={{
                      marginRight: "2px",
                      width: "10px",
                      height: "10px",
                    }}
                  />
                  <span>Online</span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "gray",
                    fontSize: "10px",
                  }}
                >
                  <FcSynchronize
                    style={{
                      marginRight: "2px",
                      width: "10px",
                      height: "10px",
                    }}
                  />
                  <span>Visto: {formattedTime}</span>
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    [isUserOnline, formatLastSeen]
  );

  // useEffect para inicializar o mapa
  useEffect(() => {
    const luandaCoords = { lat: -8.8368, lng: 13.2343 }; // Coordenadas para Mutamba, Luanda
    const googleMap = new window.google.maps.Map(mapContainerRef.current, {
      center: luandaCoords,
      zoom: 14,
    });
    setMap(googleMap);

    return () => {
      // Limpar marcadores e infoWindows quando o componente for desmontado
      clearMarkers();
    };
  }, [clearMarkers]);

  // useEffect para buscar dados dos usuários quando o componente for montado
  useEffect(() => {
    fetchDataUsersMap();

    // Atualizar dados a cada 2 minutos
    const interval = setInterval(() => {
      fetchDataUsersMap();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDataUsersMap]);

  // useEffect para adicionar marcadores ao mapa quando o mapa e os dados dos usuários estiverem disponíveis
  useEffect(() => {
    if (!map || !filteredUsers.length) return;

    // Limpar marcadores existentes
    clearMarkers();

    // Array para armazenar novos marcadores e infoWindows
    const newMarkers = [];
    const newInfoWindows = [];

    filteredUsers.forEach((user) => {
      // Verifica se o usuário tem coordenadas válidas
      if (!user.lat || !user.lng) return;

      const isOnline = isUserOnline(user);

      // Define o ícone com base no status online
      const icon = {
        url: isOnline
          ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(15, 30),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: user.lat, lng: user.lng },
        map: map,
        title: user.name || "Sem nome",
        icon: icon,
      });

      // Cria um InfoWindow para cada marcador
      const infoWindow = new window.google.maps.InfoWindow({
        pixelOffset: new window.google.maps.Size(0, -5),
      });

      // Define o conteúdo inicial
      const isExpanded = expandedMarkers[user.userId] || false;
      infoWindow.setContent(createInfoWindowContent(user, isExpanded));

      // Só abre o infoWindow se showCards for true
      if (showCards) {
        infoWindow.open(map, marker);
      }

      // Adiciona evento de clique para expandir/recolher o card
      marker.addListener("click", () => {
        const newExpandedState = !expandedMarkers[user.userId];

        setExpandedMarkers((prev) => ({
          ...prev,
          [user.userId]: newExpandedState,
        }));

        infoWindow.setContent(createInfoWindowContent(user, newExpandedState));
        infoWindow.open(map, marker);
      });

      // Adiciona o marcador e infoWindow aos arrays
      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);
    });

    // Atualiza as referências
    markersRef.current = newMarkers;
    infoWindowsRef.current = newInfoWindows;
    setInfoWindows(newInfoWindows);

    // Ajusta o zoom para mostrar todos os marcadores
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker) => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  }, [
    map,
    filteredUsers,
    expandedMarkers,
    isUserOnline,
    createInfoWindowContent,
    showCards,
    clearMarkers,
  ]);

  // Atualiza os filtros quando os parâmetros mudam
  useEffect(() => {
    applyFilters(
      usersMap,
      searchTerm,
      showOnlineOnly,
      showOfflineOnly,
      selectedDate
    );
  }, [
    searchTerm,
    usersMap,
    showOnlineOnly,
    showOfflineOnly,
    selectedDate,
    applyFilters,
  ]);

  // Atualiza o termo de pesquisa
  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  // Alterna o filtro de mostrar apenas usuários online
  const toggleOnlineFilter = () => {
    setShowOnlineOnly(true);
    setShowOfflineOnly(false);
    setSelectedDate(""); // Limpa o filtro de data
  };

  // Alterna o filtro de mostrar apenas usuários offline
  const toggleOfflineFilter = () => {
    setShowOfflineOnly(true);
    setShowOnlineOnly(false);
    setSelectedDate(""); // Limpa o filtro de data
  };

  // Mostra todos os usuários (remove filtros online/offline)
  const showAllUsers = () => {
    setShowOnlineOnly(false);
    setShowOfflineOnly(false);
    setSelectedDate(""); // Limpa o filtro de data
  };

  // Alterna a exibição dos cards
  const toggleCards = () => {
    const newShowCards = !showCards;
    setShowCards(newShowCards);

    // Atualiza a exibição dos infoWindows
    if (infoWindowsRef.current.length > 0 && markersRef.current.length > 0) {
      infoWindowsRef.current.forEach((infoWindow, index) => {
        if (infoWindow && markersRef.current[index]) {
          if (newShowCards) {
            const user = filteredUsers[index];
            if (user) {
              const isExpanded = expandedMarkers[user.userId] || false;
              infoWindow.setContent(createInfoWindowContent(user, isExpanded));
              infoWindow.open(map, markersRef.current[index]);
            }
          } else {
            infoWindow.close();
          }
        }
      });
    }
  };

  // Função para atualizar os dados
  const refreshData = () => {
    fetchDataUsersMap();
  };

  // Função para alternar a exibição do filtro de data
  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  // Função para lidar com a mudança de data
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    // Resetar outros filtros quando a data é selecionada
    if (date) {
      setShowOnlineOnly(false);
      setShowOfflineOnly(false);
    }
  };

  // Função para limpar o filtro de data
  const clearDateFilter = () => {
    setSelectedDate("");
  };

  // Função para definir a data para hoje
  const setToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setSelectedDate(formattedDate);

    // Resetar outros filtros
    setShowOnlineOnly(false);
    setShowOfflineOnly(false);
  };

  // Função para definir a data para ontem
  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split("T")[0];
    setSelectedDate(formattedDate);

    // Resetar outros filtros
    setShowOnlineOnly(false);
    setShowOfflineOnly(false);
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
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Pesquisar supervisor..."
            value={searchTerm}
            onChange={handleInputChange}
            className="form-control"
            style={{ paddingLeft: "1rem", flex: 1, minWidth: "200px" }}
          />
          <div
            className="btn-group"
            role="group"
            aria-label="Filtros de visualização"
          >
            <button
              className={`btn ${
                showOnlineOnly ? "btn-success" : "btn-outline-success"
              }`}
              onClick={toggleOnlineFilter}
              title="Mostrar apenas supervisores online"
            >
              <FaUserCheck /> Online
            </button>
            <button
              className={`btn ${
                showOfflineOnly ? "btn-danger" : "btn-outline-danger"
              }`}
              onClick={toggleOfflineFilter}
              title="Mostrar apenas supervisores offline"
            >
              <FaUserTimes /> Offline
            </button>
            <button
              className={`btn ${
                !showOnlineOnly && !showOfflineOnly && !selectedDate
                  ? "btn-outline-primary"
                  : "btn-outline-primary"
              }`}
              onClick={showAllUsers}
              title="Mostrar todos os supervisores"
            >
              <FaUsers /> Todos
            </button>
          </div>
          <div
            className="btn-group"
            role="group"
            aria-label="Controles de cards"
          >
            <button
              className={`btn ${showCards ? "btn-info" : "btn-outline-info"}`}
              onClick={toggleCards}
              title={showCards ? "Ocultar cards" : "Mostrar cards"}
            >
              {showCards ? <FaEyeSlash /> : <FaEye />}{" "}
              {showCards ? "Ocultar Cards" : "Mostrar Cards"}
            </button>
            <button
              className={`btn ${
                showDateFilter ? "btn-warning" : "btn-outline-warning"
              }`}
              onClick={toggleDateFilter}
              title="Filtrar por data"
            >
              <FaCalendarAlt /> Filtro de Data
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={refreshData}
              title="Atualizar dados"
            >
              <FcSynchronize size={20} />
            </button>
          </div>
        </div>
        {/* Filtro de data - aparece apenas quando showDateFilter é true */}
        {showDateFilter && (
          <div
            className="date-filter mt-2 mb-2"
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <label
                htmlFor="date-filter"
                style={{ marginRight: "10px", whiteSpace: "nowrap" }}
              >
                Filtrar por data:
              </label>
              <input
                type="date"
                id="date-filter"
                className="form-control"
                value={selectedDate}
                onChange={handleDateChange}
                style={{ width: "auto" }}
              />
            </div>
            <div className="btn-group" role="group">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={setToday}
                title="Definir para hoje"
              >
                Hoje
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={setYesterday}
                title="Definir para ontem"
              >
                Ontem
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={clearDateFilter}
                title="Limpar filtro de data"
                disabled={!selectedDate}
              >
                Limpar
              </button>
            </div>
            {selectedDate && (
              <span className="badge bg-warning text-dark">
                Data Selecionada: {new Date(selectedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
        <div className="mt-2">
          <span className="badge bg-light text-dark">
            Total: {filteredUsers.length} supervisores
          </span>
          <span
            className="badge bg-success text-white ml-2"
            style={{ marginLeft: "10px" }}
          >
            Online: {filteredUsers.filter((user) => isUserOnline(user)).length}{" "}
            supervisores
          </span>
          <span
            className="badge bg-danger text-white ml-2"
            style={{ marginLeft: "10px" }}
          >
            Offline:{" "}
            {filteredUsers.filter((user) => !isUserOnline(user)).length}{" "}
            supervisores
          </span>
          {selectedDate && (
            <span
              className="badge bg-warning text-dark ml-2"
              style={{ marginLeft: "10px" }}
            >
              Ativos em {new Date(selectedDate).toLocaleDateString()}:{" "}
              {filteredUsers.length} supervisores
            </span>
          )}
        </div>
        <div
          ref={mapContainerRef}
          style={{ height: "75vh", width: "100%", marginTop: "10px" }}
        ></div>
      </div>
    </div>
  );
};

export default MapOnlineComponent;
