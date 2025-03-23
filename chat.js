document.addEventListener("DOMContentLoaded", () => {
    // Определяем IP-адрес сервера
    const serverIP = window.location.hostname === "localhost" ? "localhost" : window.location.hostname;
    const socket = new WebSocket(`ws://${serverIP}:3001`);

    const chatBox = document.getElementById("chat-box");
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const clearButton = document.getElementById("clear-btn");
    const loginButton = document.getElementById("moderator-login");

    let isModerator = false;

    // Запрашиваем имя пользователя
    let userName = localStorage.getItem("userName") || prompt("Введите ваше имя:") || "Аноним";
    localStorage.setItem("userName", userName);

    // Скрываем кнопку очистки для обычных пользователей
    if (clearButton) clearButton.style.display = "none";

    // Авторизация модератора
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            const password = prompt("Введите пароль модератора:");
            if (password === "1234") { // Замените на свой пароль
                isModerator = true;
                clearButton.style.display = "inline-block";
                alert("Вы вошли как модератор.");
            } else {
                alert("Неправильный пароль!");
            }
        });
    }

    // Отправка сообщений
    if (sendButton && chatInput) {
        sendButton.addEventListener("click", () => sendMessage());
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message !== "") {
            socket.send(JSON.stringify({ name: userName, text: message }));
            chatInput.value = "";
        }
    }

    // Очистка чата (только для модератора)
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            if (isModerator) {
                chatBox.innerHTML = "";
                socket.send(JSON.stringify({ name: "Система", text: "Чат был очищен модератором." }));
            } else {
                alert("У вас нет прав для очистки чата!");
            }
        });
    }

    // Получение сообщений от сервера
    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.name && data.text) {
                const msg = document.createElement("p");
                msg.innerHTML = `<strong>${data.name}:</strong> ${data.text}`;
                chatBox.appendChild(msg);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        } catch (error) {
            console.error("Ошибка обработки сообщения:", error);
        }
    };

    // Обработка закрытия соединения
    socket.onclose = () => {
        displaySystemMessage("Соединение с сервером потеряно.", "red");
    };

    // Обработка ошибок соединения
    socket.onerror = () => {
        displaySystemMessage("Ошибка соединения с сервером.", "red");
    };

    function displaySystemMessage(text, color = "black") {
        const msg = document.createElement("p");
        msg.style.color = color;
        msg.textContent = text;
        chatBox.appendChild(msg);
    }
});
