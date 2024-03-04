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
        // localStorage.setItem("token", response.data.data.token);

        //setIsAuthenticated(true);

        navigate("/home");
      } else {
        console.log("Login falhou:", response);
        setLoginError("Credenciais inválidas. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro no login:", error.message);
      console.log(number, password);
      setLoginError(
        "Ocorreu um erro durante o login. Por favor, tente novamente."
      );
    }
  };

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`, // Use a variável backgroundImage como a URL da imagem de fundo
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="container2" style={backgroundStyle}>
      {" "}
      {/* Aplica o estilo inline com a imagem de fundo */}
      <div
        className="container col-mb-3  "
        style={{ border: "none", maxWidth: "600px" }}
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
                placeholder="Ex: +1234567890"
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
            <div className="col-12 d-flex flex-column align-items-center justify-content-center">
              <button
                className="btn button mb-3 "
                type="button"
                onClick={handleLogin}
              >
                Entrar
              </button>
              {loginError && <div className="text-danger">{loginError}</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
