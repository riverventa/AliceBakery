document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("ws://localhost:3001");
    const chatBox = document.getElementById("chat-box");
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const clearButton = document.getElementById("clear-btn");
    const loginButton = document.getElementById("moderator-login");

    let isModerator = false; // По умолчанию пользователь не модератор

    // Запрашиваем имя пользователя
    let userName = localStorage.getItem("userName");
    if (!userName) {
        userName = prompt("Введите ваше имя:");
        if (!userName) {
            userName = "Аноним"; // Если пользователь не ввел имя
        }
        localStorage.setItem("userName", userName);
    }

    // Скрываем кнопку очистки для обычных пользователей
    if (clearButton) {
        clearButton.style.display = "none";
    }

    // Авторизация модератора
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            const password = prompt("Введите пароль модератора:");
            if (password === "1234") {  // Замените на свой пароль
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
        sendButton.addEventListener("click", () => {
            const message = chatInput.value.trim();
            if (message !== "") {
                const data = JSON.stringify({ name: userName, text: message });
                socket.send(data);
                chatInput.value = "";
            }
        });

        // Отправка по нажатию Enter
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendButton.click();
        });
    }

    // Очистка чата (только для модератора)
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            if (isModerator) {
                chatBox.innerHTML = ""; // Очищаем чат
                const systemMessage = JSON.stringify({ name: "Система", text: "Чат был очищен модератором." });
                socket.send(systemMessage);
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
        const msg = document.createElement("p");
        msg.style.color = "red";
        msg.textContent = "Соединение с сервером потеряно.";
        chatBox.appendChild(msg);
    };
});
