const { exec } = require("child_process");
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const PORT = 3000;
const PUBLIC_KEY = "your_public_key";
const PRIVATE_KEY = "your_private_key";

// Запуск service.js при старте
exec("node service.js", (error, stdout, stderr) => {
    if (error) {
        console.error(`Ошибка запуска service.js: ${error.message}`);
        return;
    }
    console.log(`service.js запущен`);
});

// Настройка WebSocket
const server = new WebSocket.Server({ port: 3001 });
server.on("connection", (ws) => {
    console.log("Новый пользователь подключился!");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (!data.name || !data.text) {
                console.log("Получены некорректные данные:", data);
                return;
            }

            const formattedMessage = JSON.stringify({ name: data.name, text: data.text });

            console.log("Передача сообщения:", formattedMessage);

            server.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(formattedMessage);
                }
            });
        } catch (error) {
            console.error("Ошибка обработки сообщения:", error);
        }
    });

    ws.on("close", () => {
        console.log("Пользователь отключился.");
    });
});

// Настройка Express
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post("/create-payment", (req, res) => {
    console.log("Получен запрос на /create-payment");
    console.log("Тело запроса:", req.body);

    const lesson = req.body.lesson;
    
    if (!lesson) {
        console.log("Ошибка: lesson отсутствует в запросе!");
        return res.status(400).json({ error: "Некорректные данные" });
    }

    const paymentData = {
        public_key: PUBLIC_KEY,
        version: 3,
        action: "pay",
        amount: "10", // Укажите цену урока
        currency: "UAH",
        description: `Оплата урока ${lesson}`,
        order_id: crypto.randomUUID(),
        result_url: `http://localhost:3000/${lesson}`
    };

    const data = Buffer.from(JSON.stringify(paymentData)).toString("base64");
    const signature = crypto.createHash("sha1").update(PRIVATE_KEY + data + PRIVATE_KEY).digest("base64");

    console.log("Платёжные данные сформированы:", paymentData);

    res.json({ data, signature });
});

app.post("/liqpay-callback", (req, res) => {
    console.log("Получен callback от LiqPay:", req.body);

    const { data, signature } = req.body;
    const expectedSignature = crypto.createHash("sha1").update(PRIVATE_KEY + data + PRIVATE_KEY).digest("base64");

    if (signature !== expectedSignature) {
        console.log("Ошибка: Неверная подпись!");
        return res.status(400).json({ error: "Неверная подпись" });
    }

    const response = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    console.log("Ответ LiqPay:", response);

    if (response.status === "success" || response.status === "sandbox") {
        console.log("Оплата успешна для заказа:", response.order_id);
    } else {
        console.log("Оплата не удалась:", response.status);
    }

    res.sendStatus(200);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
