import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";

const MapOnlineComponent = () => {
    const mapContainerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [infoWindow, setInfoWindow] = useState(null);
    const [usersMap, setUsersMap] = useState([]);

    // Função para buscar dados dos usuários
    const fetchDataUsersMap = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}geolocation/findAllUserLastPosition`
            );
            if (response.data && Array.isArray(response.data.data)) {
                setUsersMap(response.data.data);
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
        setInfoWindow(new window.google.maps.InfoWindow());
    }, []);

    // useEffect para buscar dados dos usuários quando o componente for montado
    useEffect(() => {
        fetchDataUsersMap();
    }, []);

    // useEffect para adicionar marcadores ao mapa quando o mapa e os dados dos usuários estiverem disponíveis
    useEffect(() => {
        if (map && usersMap.length > 0) {
            usersMap.forEach((user) => {
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
                const isOnline = currentTime - formattedTimeDate <= fiveMinutesInMilliseconds;

                marker.addListener("click", () => {
                    infoWindow.setContent(`
            <div class="popup-content">
              <img src="/avatar2.png" alt="Foto de ${user.name}" />
              <div class="popup-text">
                <h6>Nome: ${user.name}</h6>
                <h6>Mecanográfio: ${user.userId}</h6>
                <h6>Bateria: 86%</h6>
                ${isOnline ? "<p>Online agora</p>" : `<p>Última atividade: ${formattedTime}</p>`}
              </div>
            </div>
          `);
                    infoWindow.open(map, marker);
                });
            });
        }
    }, [map, usersMap]);

    return (
        <div className="row">
            <div
                ref={mapContainerRef}
                style={{ height: "80vh", width: "100%", marginTop: "20px" }}
            ></div>
        </div>
    );
};

export default MapOnlineComponent;
