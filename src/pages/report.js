import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { format } from "date-fns";
import "./report.css"; // Importando o arquivo CSS

const StatsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [supervisions, setSupervisions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
         `${process.env.REACT_APP_API_URL}admin/metrics?size=1000&page=1`
      );
      console.log("Metrics Response:", response.data);
      setMetrics(response.data || null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Erro ao carregar métricas.");
    }
  };

  // Fetch equipment data
  const fetchEquipments = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/equipments`
      );
      console.log("Equipments Response:", response.data);
      setEquipments(
        Array.isArray(response.data?.data) ? response.data.data : []
      );
    } catch (err) {
      console.error("Error fetching equipments:", err);
      setError("Erro ao carregar equipamentos.");
    }
  };

  // Fetch supervision data
  const fetchSupervisions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/supervision`
      );
      console.log("Supervisions Response:", response.data);
      setSupervisions(
        Array.isArray(response.data?.data) ? response.data.data : []
      );
    } catch (err) {
      console.error("Error fetching supervisions:", err);
      setError("Erro ao carregar supervisões.");
    }
  };

  // Fetch employee data
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/employees`
      );
      console.log("Employees Response:", response.data);
      setEmployees(
        Array.isArray(response.data?.data) ? response.data.data : []
      );
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Erro ao carregar funcionários.");
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          fetchMetrics(),
          fetchEquipments(),
          fetchSupervisions(),
          fetchEmployees(),
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Ocorreu um erro ao carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  const getTopSiteBySupervisions = () => {
    if (!metrics?.data?.sites || metrics.data.sites.length === 0) return null;
    const topSite = metrics.data.sites.reduce((prev, curr) =>
      curr.totalSupervisions > prev.totalSupervisions ? curr : prev
    );
    return topSite.totalSupervisions > 0
      ? { name: topSite.siteName, count: topSite.totalSupervisions }
      : null;
  };

  const getTopSupervisorBySupervisions = () => {
    if (!metrics?.data?.sites || metrics.data.sites.length === 0) return null;
    const supervisorCounts = metrics.data.sites.reduce((acc, site) => {
      if (site.supervisor?.name) {
        acc[site.supervisor.name] =
          (acc[site.supervisor.name] || 0) + site.totalSupervisions;
      }
      return acc;
    }, {});
    const topSupervisor = Object.keys(supervisorCounts).reduce((a, b) =>
      supervisorCounts[a] > supervisorCounts[b] ? a : b
    );
    return supervisorCounts[topSupervisor]
      ? { name: topSupervisor, count: supervisorCounts[topSupervisor] }
      : null;
  };

  return (
    <div className="stats-page-container">
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <div className="stats-error-message">{error}</div>
      ) : (
        <div>
          <h1 className="stats-title">Estatísticas</h1>
          <div className="stats-card stats-metrics-card">
            <h6>Geral</h6>
            <ul>
              <li>Total de Supervisões: {metrics?.data?.supervisions || 0}</li>
              <li>Total de Equipamentos: {metrics?.data?.equipments || 0}</li>
              <li>Total de Funcionários: {metrics?.data?.employees || 0}</li>
            </ul>
          </div>
          <div className="stats-card stats-site-card">
            <h2>Site com Mais Supervisões</h2>
            {getTopSiteBySupervisions() ? (
              <p>
                Nome: {getTopSiteBySupervisions().name}, Total:{" "}
                {getTopSiteBySupervisions().count}
              </p>
            ) : (
              <p>Nenhum site disponível.</p>
            )}
          </div>
          <div className="stats-card stats-supervisor-card">
            <h2>Supervisor com Mais Supervisões</h2>
            {getTopSupervisorBySupervisions() ? (
              <p>
                Nome: {getTopSupervisorBySupervisions().name}, Total:{" "}
                {getTopSupervisorBySupervisions().count}
              </p>
            ) : (
              <p>Nenhum supervisor disponível.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
