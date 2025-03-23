const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3001 });

server.on("connection", (socket) => {
    console.log("Новое соединение");

    socket.on("message", (message) => {
        console.log("Получено сообщение:", message);
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on("close", () => console.log("Соединение закрыто"));
});

console.log("WebSocket сервер запущен на порту 3001");
