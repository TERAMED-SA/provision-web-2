import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useMemo } from "react";
import logo from "../assets/logo.png";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Estilos para a modal de detalhes
const customModalStyles = `  .custom-modal-overlay {    position: fixed;    top: 0;    left: 0;    right: 0;    bottom: 0;    background-color: rgba(0, 0, 0, 0.7);    display: flex;    align-items: center;    justify-content: center;    z-index: 1000;  }   .custom-modal {    background: white;    width: 90%;    max-width: 1200px;    max-height: 90vh;    border-radius: 8px;    padding: 0;    overflow-y: auto;    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);  }   .custom-modal-header {    display: flex;    justify-content: space-between;    align-items: center;    padding: 15px 20px;    background-color: #f8f9fa;    border-bottom: 1px solid #dee2e6;    border-top-left-radius: 8px;    border-top-right-radius: 8px;  }   .custom-modal-close {    background: none;    border: none;    font-size: 24px;    cursor: pointer;    color: #555;  }   .custom-modal-footer {    display: flex;    justify-content: flex-end;    gap: 10px;    padding: 15px 20px;    background-color: #f8f9fa;    border-top: 1px solid #dee2e6;    border-bottom-left-radius: 8px;    border-bottom-right-radius: 8px;  }   .btn-custom {    padding: 8px 16px;    border: none;    border-radius: 4px;    cursor: pointer;    font-weight: bold;    transition: all 0.2s;  }   .btn-success {    background-color: #28a745;    color: white;  }   .btn-success:hover {    background-color: #218838;  }   .btn-info {    background-color: #17a2b8;    color: white;  }   .btn-info:hover {    background-color: #138496;  }   .btn-secondary {    background-color: #6c757d;    color: white;  }   .btn-secondary:hover {    background-color: #5a6268;  }   .btn-primary {    background-color: #007bff;    color: white;  }   .btn-primary:hover {    background-color: #0069d9;  }   .custom-modal-body {    padding: 20px 40px;    font-family: 'Roboto', Arial, sans-serif;  }   .logo-container {    text-align: center;    margin-bottom: 20px;    padding-top: 20px;  }   .logo-container img {    max-width: 150px;    height: auto;  }   .report-title {    font-size: 22px;    font-weight: bold;    text-align: center;    margin: 30px 0 20px;    color: #333;  }   .section-title {    font-size: 18px;    font-weight: bold;    text-align: center;    margin: 20px 0 15px;    color: #333;    background-color: #f5f5f5;    padding: 8px;    border-radius: 4px;  }   .subsection-title {    font-size: 16px;    font-weight: bold;    margin: 15px 0 10px;    color: #444;    border-bottom: 1px solid #eee;    padding-bottom: 5px;  }   .info-row {    margin-bottom: 8px;    display: flex;  }   .info-label {    font-weight: bold;    min-width: 200px;  }   .info-value {    flex: 1;  }   .divider {    height: 1px;    background-color: #ddd;    margin: 20px 0;  }   .worker-section, .equipment-section {    margin-top: 15px;    padding: 15px;    border: 1px solid #eee;    border-radius: 5px;    background-color: #fafafa;  }   .item-card {    background-color: white;    border: 1px solid #eee;    border-radius: 4px;    padding: 10px 15px;    margin-bottom: 10px;    box-shadow: 0 1px 3px rgba(0,0,0,0.1);  }   .footer-note {    text-align: center;    font-size: 12px;    color: #777;    margin-top: 30px;    font-style: italic;  }   .priority-badge {    display: inline-block;    padding: 4px 8px;    border-radius: 4px;    font-weight: bold;    color: white;  }   .priority-high {    background-color: #dc3545;  }   .priority-medium {    background-color: #ffc107;    color: #212529;  }   .priority-low {    background-color: #28a745;  }`;

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // Adicionar estilos personalizados
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = customModalStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      fetchMetrics();
    }
  }, [notifications]);

  async function fetchNotifications() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}occurrence?size=100000`
      );
      const formattedNotifications = response.data.data.data.map(
        (notification) => ({
          ...notification,
          createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
          createdAtTime: format(new Date(notification.createdAt), "HH:mm"),
          createdAtDate: new Date(notification.createdAt),
          supervisorName: notification.supervisorName || "Carregando...",
          siteName: notification.name || "Carregando...",
        })
      );
      console.log(formattedNotifications);
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      toast.error("Erro ao carregar ocorrências");
    } finally {
      setIsLoading(false);
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/metrics?size=950&page=1`
      );
      setMetricsData(response.data.data.sites);
      updateNotificationsWithMetrics(response.data.data.sites);
      console.log(
        "Métricas carregadas:",
        response.data.data.sites.map((site) => site.siteName)
      );
    } catch (error) {
      console.error("Error fetching metrics:", error.message);
      toast.error("Erro ao carregar métricas");
    }
  };

  const updateNotificationsWithMetrics = (metrics) => {
    const updatedNotifications = notifications.map((notification) => {
      const metricSite = metrics.find(
        (site) => site.siteCostcenter === notification.costCenter
      );
      if (metricSite) {
        // Simplesmente use o nome do supervisor do site, sem verificação adicional
        const supervisorName = metricSite.supervisor
          ? metricSite.supervisor.name
          : "Não encontrado";
        return {
          ...notification,
          supervisorName: supervisorName,
          siteName: metricSite.siteName || notification.name || "Sem site",
        };
      }
      return notification;
    });
    setNotifications(updatedNotifications);
  };

  const handleViewDetails = async (notification) => {
    try {
      const occorence = await getOcorrenceByIdNot(notification.idNotification);
      // Combinar os dados da ocorrência com os dados da notificação
      setSelectedNotification({
        ...occorence,
        ...notification,
        createdAt: notification.createdAt,
        createdAtTime: notification.createdAtTime,
      });
      setModalShow(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da ocorrência:", error);
      toast.error("Erro ao carregar detalhes da ocorrência");
    }
  };

  async function getOcorrenceByIdNot(id) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}occurrence/getOcorByNotification/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  }

  // Função para validar se uma string é uma data válida no formato "dd/MM/yyyy"
  const isValidDate = (dateString) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateString)) return false;
    const parts = dateString.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    );
  };

  // Filtro principal
  const filteredRows = notifications
    .filter((notification) => {
      const notificationDate =
        notification.createdAt && isValidDate(notification.createdAt)
          ? notification.createdAt
          : null;
      const searchDate = selectedDate
        ? format(selectedDate, "dd/MM/yyyy")
        : null;
      return (
        (notification.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.costCenter
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.details
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.supervisorName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        (!selectedDate || notificationDate === searchDate)
      );
    })
    .map((notification, index) => ({
      id: index,
      ...notification,
    }));

  // Função para exportar para Excel
  const exportToExcel = () => {
    try {
      // Preparar os dados para exportação
      const dataToExport = filteredRows.map((notification) => {
        return {
          Data: notification.createdAt,
          Hora: notification.createdAtTime,
          Site: notification.siteName,
          "Centro de Custo": notification.costCenter,
          Supervisor: notification.supervisorName || "Não informado",
          Prioridade: getPriorityLabel(notification.priority),
          Detalhes: notification.details || "",
          "Número de Trabalhadores": notification.numberOfWorkers || 0,
          "Trabalhadores Ausentes": notification.workerInformation
            ? notification.workerInformation.length
            : 0,
          Equipamentos: notification.equipment
            ? notification.equipment.length
            : 0,
        };
      });

      // Criar uma planilha
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ocorrências");

      // Ajustar largura das colunas
      const columnsWidth = [
        { wch: 12 }, // Data
        { wch: 10 }, // Hora
        { wch: 40 }, // Site
        { wch: 15 }, // Centro de Custo
        { wch: 30 }, // Supervisor
        { wch: 15 }, // Prioridade
        { wch: 60 }, // Detalhes
        { wch: 25 }, // Número de Trabalhadores
        { wch: 25 }, // Trabalhadores Ausentes
        { wch: 15 }, // Equipamentos
      ];
      worksheet["!cols"] = columnsWidth;

      // Gerar arquivo Excel e fazer download
      const currentDate = format(new Date(), "dd-MM-yyyy");
      XLSX.writeFile(workbook, `Ocorrencias_${currentDate}.xlsx`);
      toast.success("Exportação para Excel concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast.error(`Erro ao exportar para Excel: ${error.message}`);
    }
  };

  // Função para exportar uma ocorrência específica para Excel
  const exportSingleToExcel = (notification) => {
    try {
      if (!notification) {
        toast.error("Nenhuma ocorrência selecionada");
        return;
      }

      // Preparar dados da ocorrência para Excel
      const mainData = [
        {
          Site: notification.siteName,
          "Centro de Custo": notification.costCenter,
          Supervisor: notification.supervisorName || "Não informado",
          Data: notification.createdAt,
          Hora: notification.createdAtTime,
          Prioridade: getPriorityLabel(notification.priority),
          "Número de Trabalhadores": notification.numberOfWorkers || 0,
          Detalhes: notification.details || "Sem detalhes disponíveis.",
        },
      ];

      // Criar planilha principal
      const mainWorksheet = XLSX.utils.json_to_sheet(mainData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        mainWorksheet,
        "Informações Gerais"
      );

      // Ajustar largura das colunas da planilha principal
      const mainColumnsWidth = [
        { wch: 40 }, // Site
        { wch: 15 }, // Centro de Custo
        { wch: 30 }, // Supervisor
        { wch: 12 }, // Data
        { wch: 10 }, // Hora
        { wch: 15 }, // Prioridade
        { wch: 25 }, // Número de Trabalhadores
        { wch: 60 }, // Detalhes
      ];
      mainWorksheet["!cols"] = mainColumnsWidth;

      // Adicionar planilha de trabalhadores se houver dados
      if (
        notification.workerInformation &&
        notification.workerInformation.length > 0
      ) {
        const workersData = notification.workerInformation.map(
          (worker, index) => ({
            Nº: index + 1,
            Nome: worker.name || "N/A",
            "Número de Empregado": worker.employeeNumber || "N/A",
            Estado: worker.state || "N/A",
            Observações: worker.obs || "N/A",
          })
        );

        const workersWorksheet = XLSX.utils.json_to_sheet(workersData);
        XLSX.utils.book_append_sheet(
          workbook,
          workersWorksheet,
          "Trabalhadores"
        );

        // Ajustar largura das colunas da planilha de trabalhadores
        const workersColumnsWidth = [
          { wch: 5 }, // Nº
          { wch: 30 }, // Nome
          { wch: 20 }, // Número de Empregado
          { wch: 15 }, // Estado
          { wch: 40 }, // Observações
        ];
        workersWorksheet["!cols"] = workersColumnsWidth;
      }

      // Adicionar planilha de equipamentos se houver dados
      if (notification.equipment && notification.equipment.length > 0) {
        const equipmentData = notification.equipment.map((equip, index) => ({
          Nº: index + 1,
          Nome: equip.name || "N/A",
          "Número de Série": equip.serialNumber || "N/A",
          Estado: equip.state || "N/A",
          "Centro de Custo": equip.costCenter || "N/A",
          Observações: equip.obs || "N/A",
        }));

        const equipmentWorksheet = XLSX.utils.json_to_sheet(equipmentData);
        XLSX.utils.book_append_sheet(
          workbook,
          equipmentWorksheet,
          "Equipamentos"
        );

        // Ajustar largura das colunas da planilha de equipamentos
        const equipmentColumnsWidth = [
          { wch: 5 }, // Nº
          { wch: 30 }, // Nome
          { wch: 20 }, // Número de Série
          { wch: 15 }, // Estado
          { wch: 15 }, // Centro de Custo
          { wch: 40 }, // Observações
        ];
        equipmentWorksheet["!cols"] = equipmentColumnsWidth;
      }

      // Gerar arquivo Excel e fazer download
      XLSX.writeFile(
        workbook,
        `Ocorrencia_${notification.costCenter}_${format(
          new Date(),
          "dd-MM-yyyy"
        )}.xlsx`
      );
      toast.success("Ocorrência exportada para Excel com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar ocorrência para Excel:", error);
      toast.error(`Erro ao exportar para Excel: ${error.message}`);
    }
  };

  const generatePDF = async () => {
    try {
      if (!selectedNotification) {
        toast.error("Nenhuma ocorrência selecionada");
        return;
      }
      // Criar novo documento PDF
      const doc = new jsPDF();
      // Definir margens e posição inicial
      const margin = 20;
      let yPos = 20;
      // Adicionar logo
      try {
        // Usar um tamanho fixo para o logo para evitar problemas
        doc.addImage(logo, "PNG", 80, yPos, 50, 25);
        yPos += 35;
      } catch (logoError) {
        console.error("Erro ao adicionar logo:", logoError);
        // Continuar mesmo se o logo falhar
        yPos += 10;
      }
      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("RELATÓRIO DE OCORRÊNCIA", 105, yPos, { align: "center" });
      yPos += 10;
      // Linha divisória
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, 210 - margin, yPos);
      yPos += 10;
      // Seção de informações gerais
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMAÇÕES GERAIS", 105, yPos, { align: "center" });
      yPos += 10;
      // Informações gerais em formato de texto
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Local:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(selectedNotification.siteName || "N/A", margin + 60, yPos);
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Centro de Custo:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(selectedNotification.costCenter || "N/A", margin + 60, yPos);
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Supervisor:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(
        selectedNotification.supervisorName || "Não informado",
        margin + 60,
        yPos
      );
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Data:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(selectedNotification.createdAt || "N/A", margin + 60, yPos);
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Hora:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(selectedNotification.createdAtTime || "N/A", margin + 60, yPos);
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Prioridade:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(
        getPriorityLabel(selectedNotification.priority) || "N/A",
        margin + 60,
        yPos
      );
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Número de Trabalhadores:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(
        String(selectedNotification.numberOfWorkers || 0),
        margin + 60,
        yPos
      );
      yPos += 15;
      // Linha divisória
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos - 5, 210 - margin, yPos - 5);
      // Detalhes da ocorrência
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DETALHES DA OCORRÊNCIA", 105, yPos, { align: "center" });
      yPos += 10;
      // Texto dos detalhes
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      // Quebrar texto longo em múltiplas linhas
      const detailsText =
        selectedNotification.details || "Sem detalhes disponíveis.";
      const splitDetails = doc.splitTextToSize(detailsText, 170);
      // Verificar se precisa de nova página
      if (yPos + splitDetails.length * 7 > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(splitDetails, margin, yPos);
      yPos += splitDetails.length * 7 + 15;
      // Linha divisória
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos - 5, 210 - margin, yPos - 5);
      // Informações dos trabalhadores
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMAÇÃO DOS TRABALHADORES", 105, yPos, { align: "center" });
      yPos += 10;
      // Verificar se há trabalhadores
      if (
        selectedNotification.workerInformation &&
        selectedNotification.workerInformation.length > 0
      ) {
        doc.setFontSize(11);
        selectedNotification.workerInformation.forEach((worker, index) => {
          // Verificar se precisa de nova página
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          // Adicionar retângulo de fundo
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPos - 3, 170, 30, "F");
          doc.setFont("helvetica", "bold");
          doc.text(`Trabalhador ${index + 1}:`, margin + 2, yPos);
          yPos += 7;
          doc.setFont("helvetica", "bold");
          doc.text("Nome:", margin + 5, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(worker.name || "N/A", margin + 40, yPos);
          doc.setFont("helvetica", "bold");
          doc.text("Número:", margin + 90, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(worker.employeeNumber || "N/A", margin + 125, yPos);
          yPos += 7;
          doc.setFont("helvetica", "bold");
          doc.text("Estado:", margin + 5, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(worker.state || "N/A", margin + 40, yPos);
          doc.setFont("helvetica", "bold");
          doc.text("Obs:", margin + 90, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(worker.obs || "N/A", margin + 125, yPos);
          yPos += 12;
        });
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Nenhuma informação de trabalhador disponível.", margin, yPos);
        yPos += 10;
      }
      yPos += 5;
      // Linha divisória
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos - 5, 210 - margin, yPos - 5);
      // Equipamentos
      // Verificar se precisa de nova página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("EQUIPAMENTOS", 105, yPos, { align: "center" });
      yPos += 10;
      // Verificar se há equipamentos
      if (
        selectedNotification.equipment &&
        selectedNotification.equipment.length > 0
      ) {
        doc.setFontSize(11);
        selectedNotification.equipment.forEach((equip, index) => {
          // Verificar se precisa de nova página
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          // Adicionar retângulo de fundo
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPos - 3, 170, 30, "F");
          doc.setFont("helvetica", "bold");
          doc.text(`Equipamento ${index + 1}:`, margin + 2, yPos);
          yPos += 7;
          doc.setFont("helvetica", "bold");
          doc.text("Nome:", margin + 5, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(equip.name || "N/A", margin + 40, yPos);
          doc.setFont("helvetica", "bold");
          doc.text("Número de Série:", margin + 90, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(equip.serialNumber || "N/A", margin + 150, yPos);
          yPos += 7;
          doc.setFont("helvetica", "bold");
          doc.text("Estado:", margin + 5, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(equip.state || "N/A", margin + 40, yPos);
          doc.setFont("helvetica", "bold");
          doc.text("Centro de Custo:", margin + 90, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(equip.costCenter || "N/A", margin + 150, yPos);
          yPos += 12;
          if (equip.obs) {
            doc.setFont("helvetica", "bold");
            doc.text("Observações:", margin + 5, yPos);
            doc.setFont("helvetica", "normal");
            const obsLines = doc.splitTextToSize(equip.obs, 160);
            doc.text(obsLines, margin + 40, yPos);
            yPos += obsLines.length * 7 + 5;
          }
        });
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Nenhum equipamento registrado.", margin, yPos);
        yPos += 10;
      }
      // Rodapé
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(
          `Página ${i} de ${pageCount} - Gerado pelo sistema em ${format(
            new Date(),
            "dd/MM/yyyy HH:mm"
          )}`,
          105,
          285,
          { align: "center" }
        );
      }
      // Salvar o PDF
      doc.save(
        `Ocorrencia_${selectedNotification.costCenter}_${format(
          new Date(),
          "ddMMyyyy_HHmm"
        )}.pdf`
      );
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(`Erro ao gerar o PDF: ${error.message}`);
    }
  };

  const handleApproval = () => {
    toast.warning(
      "Ainda não foi realizado o tratamento adequado desta informação."
    );
  };

  const sortedRows = [...filteredRows]
    .map((row) => {
      let createdAtTimestamp = 0; // Valor padrão para datas inválidas
      if (row.createdAtDate) {
        createdAtTimestamp = row.createdAtDate.getTime();
      }
      return {
        ...row,
        createdAtTimestamp, // Adiciona o timestamp para ordenação
      };
    })
    .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp); // Ordena em ordem decrescente

  console.log("Dados depois da ordenação:", sortedRows);

  function getPriorityLabel(priority) {
    switch (priority) {
      case 0:
        return "Máxima";
      case 1:
        return "Média";
      case 2:
        return "Mínima";
      default:
        return "Baixa";
    }
  }

  function getPriorityClass(priority) {
    switch (priority) {
      case 0:
        return "priority-high";
      case 1:
        return "priority-medium";
      case 2:
        return "priority-low";
      default:
        return "priority-low";
    }
  }

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <h1 style={{ textAlign: "center" }}>
        OCORRÊNCIAS<span className="badge badge-secondary"></span>
      </h1>
      <div className="container-fluid">
        <Link to="/Home" className="p-1">
          Início{" "}
        </Link>{" "}
        / <span>Ocorrências</span>
        <br></br> <br></br>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginRight: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Pesquisar por site, supervisor ou detalhes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "5px", width: "300px" }}
            />
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Filtrar por data"
            className="form-control"
            isClearable
          />
          <Button
            variant="success"
            style={{ marginLeft: "15px", padding: "5px 15px" }}
            onClick={exportToExcel}
          >
            Exportar para Excel
          </Button>
        </div>
        <div className="mt-3">
          <strong>Número total de ocorrências encontradas:</strong>{" "}
          {filteredRows.length}
        </div>
      </div>
      {isLoading ? (
        <div className="text-center mt-4">
          <CircularProgress size={80} thickness={5} />
        </div>
      ) : filteredRows.length === 0 ? (
        <p>Nenhuma ocorrência encontrada</p>
      ) : (
        <div style={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={sortedRows}
            columns={[
              {
                field: "createdAtTime",
                headerName: "Hora",
                width: 90,
                disableColumnSorting: true,
              },
              {
                field: "createdAt",
                headerName: "Data",
                width: 100,
                disableColumnSorting: true,
              },
              {
                field: "siteName",
                headerName: "Site",
                width: 450,
              },
              {
                field: "supervisorName",
                headerName: "Supervisor",
                width: 200,
                valueGetter: (params) =>
                  params.row.supervisorName || "Não informado",
              },
              {
                field: "details",
                headerName: "Detalhes",
                width: 500,
                renderCell: (params) => {
                  // Limitar o texto a dois parágrafos ou aproximadamente 150 caracteres
                  const fullText = params.value || "";
                  let limitedText = fullText;
                  // Verificar se há parágrafos
                  const paragraphs = fullText.split(/\n+/);
                  if (paragraphs.length > 2) {
                    limitedText = paragraphs.slice(0, 2).join("\n") + "...";
                  } else if (fullText.length > 50) {
                    // Se não houver parágrafos claros, limitar por caracteres
                    limitedText = fullText.substring(0, 50) + "...";
                  }
                  return (
                    <div style={{ whiteSpace: "normal", lineHeight: "50" }}>
                      {limitedText}
                    </div>
                  );
                },
              },
              {
                field: "priority",
                headerName: "Prioridade",
                width: 120,
                renderCell: (params) => (
                  <div
                    className={`priority-badge ${getPriorityClass(
                      params.value
                    )}`}
                  >
                    {getPriorityLabel(params.value)}
                  </div>
                ),
              },
              {
                field: "actions",
                headerName: "Ações",
                width: 130,
                renderCell: (params) => (
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleViewDetails(params.row)}
                  >
                    Ver Mais
                  </Button>
                ),
              },
            ]}
            disableColumnSorting
            disableSelectionOnClick
            getRowId={(row) => row.id}
            hideFooter={true}
            rowCount={sortedRows.length}
            disableColumnFilter
            disableDensitySelector
            disableColumnMenu
            disableColumnSelector
            disableVirtualization={false}
            rowsPerPageOptions={[]}
            pagination={false}
          />
        </div>
      )}
      {/* Modal de detalhes personalizada */}
      {modalShow && selectedNotification && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <h2>Detalhes da Ocorrência</h2>
              <button
                className="custom-modal-close"
                onClick={() => setModalShow(false)}
              >
                ×
              </button>
            </div>
            <div className="custom-modal-body">
              <div className="logo-container">
                <img src={logo} alt="Logo" />
              </div>
              <div className="report-title">RELATÓRIO DE OCORRÊNCIA</div>
              <div className="section-title">INFORMAÇÕES GERAIS</div>
              <div className="info-row">
                <div className="info-label">Local:</div>
                <div className="info-value">
                  {selectedNotification.siteName}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Centro de Custo:</div>
                <div className="info-value">
                  {selectedNotification.costCenter}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Supervisor:</div>
                <div className="info-value">
                  {selectedNotification.supervisorName || "Não informado"}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Data:</div>
                <div className="info-value">
                  {selectedNotification.createdAt}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Hora:</div>
                <div className="info-value">
                  {selectedNotification.createdAtTime}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Prioridade:</div>
                <div className="info-value">
                  <span
                    className={`priority-badge ${getPriorityClass(
                      selectedNotification.priority
                    )}`}
                  >
                    {getPriorityLabel(selectedNotification.priority)}
                  </span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Número de Trabalhadores:</div>
                <div className="info-value">
                  {selectedNotification.numberOfWorkers || 0}
                </div>
              </div>
              <div className="divider"></div>
              <div className="section-title">DETALHES DA OCORRÊNCIA</div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                {selectedNotification.details || "Sem detalhes disponíveis."}
              </div>
              <div className="section-title">INFORMAÇÃO DOS TRABALHADORES</div>
              <div className="worker-section">
                {selectedNotification.workerInformation &&
                selectedNotification.workerInformation.length > 0 ? (
                  selectedNotification.workerInformation.map(
                    (worker, index) => (
                      <div key={index} className="item-card">
                        <div className="info-row">
                          <div className="info-label">Nome:</div>
                          <div className="info-value">{worker.name}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Número de Empregado:</div>
                          <div className="info-value">
                            {worker.employeeNumber}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Estado:</div>
                          <div className="info-value">{worker.state}</div>
                        </div>
                        {worker.obs && (
                          <div className="info-row">
                            <div className="info-label">Observações:</div>
                            <div className="info-value">{worker.obs}</div>
                          </div>
                        )}
                      </div>
                    )
                  )
                ) : (
                  <p>Nenhuma informação de trabalhador disponível.</p>
                )}
              </div>
              <div className="divider"></div>
              <div className="section-title">EQUIPAMENTOS</div>
              <div className="equipment-section">
                {selectedNotification.equipment &&
                selectedNotification.equipment.length > 0 ? (
                  selectedNotification.equipment.map((equip, index) => (
                    <div key={index} className="item-card">
                      <div className="info-row">
                        <div className="info-label">Nome:</div>
                        <div className="info-value">{equip.name}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Número de Série:</div>
                        <div className="info-value">{equip.serialNumber}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Estado:</div>
                        <div className="info-value">{equip.state}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Centro de Custo:</div>
                        <div className="info-value">{equip.costCenter}</div>
                      </div>
                      {equip.obs && (
                        <div className="info-row">
                          <div className="info-label">Observações:</div>
                          <div className="info-value">{equip.obs}</div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Nenhum equipamento registrado.</p>
                )}
              </div>
              <div className="footer-note">
                Gerado pelo sistema - Visualização da ocorrência
              </div>
            </div>
            <div className="custom-modal-footer">
              <button
                className="btn-custom btn-info"
                onClick={() =>
                  generatePDF(
                    selectedNotification._id,
                    selectedNotification.name
                  )
                }
              >
                Gerar PDF
              </button>
              <button
                className="btn btn-sucess"
                onClick={() => exportSingleToExcel(selectedNotification)}
              >
                Exportar para Excel
              </button>
              <button
                className="btn-custom btn-secondary"
                onClick={() => setModalShow(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default NotificationList;
