import React, { useEffect, useState } from "react";
import axios from "axios";

const MapComponent = () => {
  const [users, setUsers] = useState([]);
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);

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
  }, []);

  useEffect(() => {
    if (users.length > 0 && !map) {
      const centerLat = users.reduce((acc, user) => acc + user.lat, 0) / users.length;
      const centerLng = users.reduce((acc, user) => acc + user.lng, 0) / users.length;
      const mapCenter = { lat: centerLat, lng: centerLng };

      const newMap = new window.google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 14,
      });
      setMap(newMap);
      setInfoWindow(new window.google.maps.InfoWindow());
    }

    if (map) {
      users.forEach((user) => {
        const marker = new window.google.maps.Marker({
          position: { lat: user.lat, lng: user.lng },
          map: map,
          title: user.userId,
        });

        marker.addListener("click", () => {
          infoWindow.setContent(`
            <div>
              <h3>${user.userId}</h3>
              <p>Coordenadas: [${user.lat.toFixed(6)}, ${user.lng.toFixed(6)}]</p>
              <p>Última atividade: ${new Date(user.time).toLocaleString()}</p>
            </div>
            
          `);
          infoWindow.open(map, marker);
        });
      });
    }
  }, [users, map, infoWindow]);

  return <div id="map" style={{ height: "600px", width: "100%" }}></div>;
};

export default MapComponent;
