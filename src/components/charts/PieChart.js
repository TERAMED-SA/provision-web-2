import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

function PieChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch todas as empresas
        const companyResponse = await fetch("https://provision-07c1.onrender.com/api/v1/company");
        const companyData = await companyResponse.json();
        const companies = companyData?.data?.data || [];

        // Fetch todos os sites
        const siteResponse = await fetch("https://provision-07c1.onrender.com/api/v1/companySite");
        const siteData = await siteResponse.json();
        const sites = siteData?.data?.data || [];

        // Mapear os sites para suas respectivas empresas
        const sitesMapped = sites.map((site) => {
          const company = companies.find((c) => c.clientCode === site.clientCode);
          return { company: company?.name || "Empresa Desconhecida" };
        });

        // Contar o número de sites por empresa
        const sitesCount = {};
        sitesMapped.forEach((site) => {
          sitesCount[site.company] = (sitesCount[site.company] || 0) + 1;
        });

        // Preparar dados para o gráfico
        const chartLabels = Object.keys(sitesCount);
        const chartDataValues = Object.values(sitesCount);

        // Atualizar o estado do gráfico
        setChartData({
          labels: chartLabels,
          datasets: [
            {
              label: "Número de Sites",
              data: chartDataValues,
              backgroundColor: [
                "#0437f2",
                "#ff0000",
                "#00ff00",
                "#ffff00",
                "#ff00ff",
                "#00ffff",
              ],
              borderColor: "#fff",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Número de Sites por Clientes",
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-secondary">
      {chartData && <Pie data={chartData} options={options} />}
    </div>
  );
}

export default PieChart;
