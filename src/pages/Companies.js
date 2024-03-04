import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar"; // Importa o componente Avatar
import { css } from "@emotion/react";
import { ClipLoader } from "react-spinners";
import "./Companies.css";
import "./ManagementList.css";

// CSS override for spinner
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Companies = () => {
  const navigate = useNavigate();
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}company?size=100`
        );
        const sortedCompanies = response.data.data.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setCompanyList(sortedCompanies);
      } catch (error) {
        console.error("Erro:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Handle click event for company item
  const handleItemClick = (clientCode) => {
    localStorage.setItem("selectedCompany", clientCode);
    navigate("/managementList");
  };

  return (
    <div className="container4 mr-2" style={{ height: "89vh" }}>
      <div className="container-fluid">
        <div className="container4">
          {loading ? (
            // Display spinner when loading
            <div className="loading-spinner d-flex justify-content-center align-items-center">
              <ClipLoader color="blue" loading={loading} size={150} css={override} />
            </div>
          ) : (
            // Display company list when loaded
            <table>
              <tbody>
                {companyList.map((company, index) => (
                  <tr key={index} onClick={() => handleItemClick(company.clientCode)} style={{ cursor: "pointer" }}>
                    <td>
                      {/* Utiliza o componente Avatar para mostrar as iniciais do nome da empresa */}
                      <Avatar className="justify-content-center align-items-center" name={company.name} size="50" round={true} />
                      {company.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;