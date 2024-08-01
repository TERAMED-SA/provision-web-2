import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";
import Pusher from "pusher-js"; // Adicionado o import do Pusher
import "react-toastify/dist/ReactToastify.css"; // Importação do CSS do react-toastify

import "./Chat.css";
const apiUrl = process.env.REACT_APP_API_URL;
const headers = {
  "Content-Type": "application/json",
};

const Chat = () => {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersList, setUserList] = useState([]);
  const messagesEndRef = useRef(null);
  const [userSender, setUserSender] = useState("");
  const [userReceiver, setUserReceiver] = useState("");
  const [socket, setSocket] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState(false); // Estado para controlar a notificação de nova mensagem

  useEffect(() => {
    fetchChat();
    const newSocket = io("https://provision-07c1.onrender.com");

    newSocket.on("connect", () => {
      console.log("Conectado ao servidor Socket.io");
    });

    newSocket.on("sendMessage", (newMessage) => {
      setConversations((prevConversations) => [
        ...prevConversations,
        newMessage,
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const pusher = new Pusher(`${process.env.REACT_APP_KEY}`, {
      cluster: `${process.env.REACT_APP_CLUSTER}`,
      encrypted: true,
    });

    const channel = pusher.subscribe("my-channel");

    channel.bind("newMessage", (data) => {
      // Aqui você pode decidir como lidar com a nova mensagem recebida
      setNovaMensagem(true); // Define o estado novaMensagem como verdadeiro
    });

    return () => {
      pusher.unsubscribe("my-channel");
    };
  }, []);

  useEffect(() => {
    if (novaMensagem) {
      toast.info("Nova mensagem recebida!"); // Exibe a notificação de nova mensagem
      setNovaMensagem(false); // Reseta o estado novaMensagem após exibir a notificação
    }
  }, [novaMensagem]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const interval = setInterval(() => {
        fetchMessages(); // Atualiza as mensagens a cada 5 segundos
      }, 5000); // 5000 ms = 5 segundos

      return () => clearInterval(interval); // Limpa o intervalo quando o componente é desmontado
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchChat = async () => {
    try {
      const response = await axios.get(`${apiUrl}user/?size=50`);
      const mec = localStorage.getItem("userId");
      const filterUser = response.data.data.data.filter(
        (user) => user.mecCoordinator === mec
      );
      setUserList(filterUser);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUser) return; // Evita a execução da função sem usuário selecionado

    const mecCoordinator = localStorage.getItem("userId");
    const fetchUrl = `${apiUrl}chat/${mecCoordinator}/${selectedUser.employeeId}?size=500`;
    const fetchUrlUser = `${apiUrl}chat/${selectedUser.employeeId}/${mecCoordinator}?size=500`;

    try {
      const response = await axios.get(fetchUrl, { headers });
      const responseUser = await axios.get(fetchUrlUser, { headers });
      const join = [...response.data.data.data, ...responseUser.data.data.data];

      setUserSender(mecCoordinator);
      setUserReceiver(selectedUser.employeeId);
      setConversations(
        join.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    const sendUrl = `${apiUrl}chat/send/${userSender}/${userReceiver}`;
    try {
      const response = await axios.post(
        sendUrl,
        { message: message },
        { headers }
      );

      socket.emit("sendMessage", response.data.data.message);
      socket.disconnect();
      setConversations((prevConversations) => [
        ...prevConversations,
        response.data.data,
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes}`;
  };

  return (
    <div className="container1">
      <div className="container2-fluid h-100">
        <div className="row justify-content-center h-100">
          <div className="col-md-4 col-3 chat">
            <div
              className="card mb-sm-3 mb-md-0 contacts_card"
              style={{ height: "80vh" }}
            >
              <div className="card_chats">
                <h2 id="chat_title">
                  Chat <i class="bi bi-chat"></i>
                </h2>
              </div>
              <div className="card-body contacts_body">
                <ul className="contacts">
                  {usersList.map((user) => (
                    <li
                      key={user.employeeId}
                      onClick={() => setSelectedUser(user)}
                      className={selectedUser === user ? "active" : ""}
                    >
                      <div className="d-flex bd-highlight">
                        <div className="avatar_cont">
                          <span
                            className={`online_icon ${
                              user.online ? "online" : "offline"
                            }`}
                          ></span>
                        </div>
                        <div className="user_info">
                          {selectedUser !== user && (
                            <>
                              <span id="usuarionome">{user.name}</span>
                              <p>{user.online ? "Online" : "Offline"}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-footer"></div>
            </div>
          </div>

          {selectedUser && (
            <div className="col-md-8 col-xl-7 chat">
              <div className="card" id="chat1" style={{ height: "80vh" }}>
                <div className="card-header msg_head" id="heaadermsg">
                  <div className="d-flex bd-highlight">
                    <div className="avatar_cont">
                      <span
                        className={`online_icon ${
                          selectedUser && selectedUser.online
                            ? "online"
                            : "offline"
                        }`}
                      ></span>
                    </div>
                    <div className="user_info">
                      <span>{selectedUser ? selectedUser.name : ""}</span>
                      <p>{`${conversations.length} Messages`}</p>
                    </div>
                    <div className="video_cam">
                      <span>
                        <i className="fas fa-video"></i>
                      </span>
                      <span>
                        <i className="fas fa-phone"></i>
                      </span>
                    </div>
                  </div>
                  <span id="action_menu_btn">
                    <i className="fas fa-ellipsis-v"></i>
                  </span>
                </div>

                <div className="card-body msg_card_body">
                  {conversations.map((msg, index) => (
                    <div
                      key={index}
                      className={`d-flex justify-content-${
                        msg.users.send === userSender ? "end" : "start"
                      } mb-4`}
                    >
                      <div className="avatar_cont_msg"></div>
                      <div
                        className={`msg_cotainer${
                          msg.users.receive === userReceiver ? "_send" : ""
                        }`}
                      >
                        {msg.message}
                        <span className="msg_time" id="sms">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="card-footer" id="footermsg">
                  <div className="input-group">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      name=""
                      className="form-control type_msg"
                      placeholder="Escrever..."
                    ></textarea>
                    <div className="input-group-append">
                      <button
                        onClick={() => sendMessage()} // Use an arrow function to pass the callback
                        className="btn btn-primary mt-2 mr-2"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
