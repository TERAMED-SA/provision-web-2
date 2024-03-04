/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import io from "socket.io-client";

import "./Chat.css";
const apiUrl = process.env.REACT_APP_API_URL; // Update with your server URL
const headers = {
  "Content-Type": "application/json",
};

// const socket = io(`https://provision-07c1.onrender.com`);

const Chat = () => {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersList, setUserList] = useState([]);
  const messagesEndRef = useRef(null);
  const [userSender, setUserSender] = useState("");
  const [userReceiver, setUserReceiver] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchChat();
    if (selectedUser) {
      fetchMessages();
    }
    // Configurar e conectar o socket quando o componente monta
    const newSocket = io("https://provision-07c1.onrender.com");

    // Lida com a conexão bem-sucedida
    newSocket.on("connect", () => {
      console.log("Conectado ao servidor Socket.io");
    });

    // Lida com mensagens recebidas do servidor
    newSocket.on("sendMessage", (newMessage) => {
      // Atualiza as conversas
      setConversations((prevConversations) => [
        ...prevConversations,
        newMessage,
      ]);
      scrollToBottom();
    });

    // Configura o socket no estado
    setSocket(newSocket);

    // Remova os ouvintes quando o componente for desmontado
    return () => {
      newSocket.disconnect();
    };
  }, [selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
    console.log(selectedUser.employeeId);
    const mecCoordinator = localStorage.getItem("userId");
    console.log(mecCoordinator);

    const fetchUrl = `${apiUrl}chat/${mecCoordinator}/${selectedUser.employeeId}?size=500`;
    const fetchUrlUser = `${apiUrl}chat/${selectedUser.employeeId}/${mecCoordinator}?size=500`;

    try {
      const response = await axios.get(fetchUrl, { headers });
      const responseUser = await axios.get(fetchUrlUser, { headers });
      console.log(
        "Messages fetched successfully:",
        responseUser.data.data.data
      );

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

  // eslint-disable-next-line no-unused-vars
  const handleUserSelect = (event) => {
    const selectedUserId = event.target.value;
    const selectedUser = usersList.find((user) => user.id === selectedUserId);
    setSelectedUser(selectedUser);
  };

  // eslint-disable-next-line no-unused-vars
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
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
                              <span>{user.name}</span>
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

          <div className="col-md-8 col-xl-7 chat">
            <div className="card" style={{ height: "80vh" }}>
              <div className="card-header msg_head">
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
                      <span className="msg_time">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="card-footer">
                <div className="input-group">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    name=""
                    className="form-control type_msg"
                    placeholder="Type your message..."
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
        </div>
      </div>
    </div>
  );
};

export default Chat;
