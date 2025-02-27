import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import backgroundImage from "../assets/home1.png"; // Importe a imagem de fundo
import "./Login.css";

function Login({ setIsAuthenticated }) {
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showModal, setShowModal] = useState(false); // Estado para controlar a exibição da modal
  const [resetPhone, setResetPhone] = useState(""); // Estado para o telefone na modal
  const [newPassword, setNewPassword] = useState(""); // Estado para a nova senha na modal
  const [resetError, setResetError] = useState(""); // Estado para erros no reset de senha
  const [resetSuccess, setResetSuccess] = useState(""); // Estado para sucesso no reset de senha

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!number || !password) {
        setLoginError("Por favor, preencha todos os campos.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}userAuth/signIn`,
        {
          number,
          password,
        }
      );

      if (response.data.data.status === 200) {
        // Armazene as informações do usuário no localStorage
        localStorage.setItem("userId", response.data.data.data.employeeId);
        localStorage.setItem("userName", response.data.data.data.name);
        localStorage.setItem("userPhone", response.data.data.data.phoneNumber);

        navigate("/home");
      } else {
        console.log("Login falhou:", response);
        setLoginError(
          "Ocorreu um erro durante o login. Por favor, tente novamente."
        );
      }
    } catch (error) {
      console.error("Erro no login:", error.message);
      setLoginError("Credenciais inválidas. Por favor, tente novamente.");
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (!resetPhone || !newPassword) {
        setResetError("Por favor, preencha todos os campos.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}userAuth/resetPassword`,
        {
          phoneNumber: resetPhone,
          newPassword,
        }
      );

      if (response.data.status === 200) {
        setResetSuccess("Senha redefinida com sucesso!");
        setResetError("");
        setResetPhone("");
        setNewPassword("");
        setTimeout(() => setShowModal(false), 3000); // Fecha a modal após 3 segundos
      } else {
        setResetError("Erro ao redefinir a senha. Por favor, tente novamente.");
        setResetSuccess("");
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error.message);
      setResetError("Erro ao redefinir a senha. Por favor, tente novamente.");
      setResetSuccess("");
    }
  };

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="container2" style={backgroundStyle}>
      <div
        className="container col-mb-3"
        style={{ border: "none", background: "#ffffffed", maxWidth: "600px" }}
      >
        <div className="d-flex flex-column justify-content-center align-items-center col-lg-12 col-md-12 col-sm-12 col-xs-12 mb-4">
          <div className="mb-4">
            <img src={logo} alt="Provision" width={135} />
          </div>
          <span className="text-center white-text">
            Bem-vindo à Plataforma Provision
          </span>

          <form className="row g-3" style={{ maxWidth: "400px", width: "80%" }}>
            <div className="col-12">
              <label htmlFor="number" className="form-label white-text">
                Número de Telefone
              </label>
              <input
                className="form-control"
                type="tel"
                name="number"
                id="number"
                placeholder="Ex: +244934567890"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            <div className="col-12">
              <label htmlFor="password" className="form-label white-text">
                Palavra-passe
              </label>
              <input
                className="form-control"
                type="password"
                name="password"
                id="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="col-md-12 d-flex flex-column align-items-center justify-content-center">
              <button
                className="btn btn-primary mb-3"
                type="button"
                onClick={handleLogin}
              >
                Entrar
              </button>
              {loginError && <div className="text-danger">{loginError}</div>}
              {/*    <button
                className="btn btn-link text-primary"
                onClick={() => setShowModal(true)}
                type="button"
              >
                Esqueci a senha
              </button>Modal */}
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-center">Redefinir Senha</h3>
            <div className="form-group">
              <label htmlFor="resetPhone">Número de Telefone</label>
              <input
                className="form-control"
                type="tel"
                id="resetPhone"
                placeholder="Ex: +244934567890"
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nova Palavra-passe</label>
              <input
                className="form-control"
                type="password"
                id="newPassword"
                placeholder="******"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handlePasswordReset}>
                Redefinir
              </button>
            </div>
            {resetError && <div className="text-danger mt-3">{resetError}</div>}
            {resetSuccess && (
              <div className="text-success mt-3">{resetSuccess}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
