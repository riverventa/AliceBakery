// Инициация оплаты при нажатии на кнопку
function initiatePayment(button) {
    const lesson = button.getAttribute("data-lesson");
    console.log("Оплата за урок:", lesson); // Проверка, что урок передается
    openPaymentModule(lesson);
}

// Открытие модуля оплаты
function openPaymentModule(lesson) {
    alert(`Оплата урока: ${lesson}`); // Здесь будет ваш код для интеграции с LiqPay

    // Пример данных для платежа
    let public_key = "sandbox_136206262233"; // Заменить на свой публичный ключ
    let private_key = "sandbox_xyOigbelP5ZDLpTVvIuSAogLrVdvnAqdjyC7QY2e"; // Заменить на свой приватный ключ
    let amount = "800"; // Цена урока
    let currency = "UAH";
    let description = "Оплата урока: " + lesson;
    let order_id = "order_" + Date.now();
    
    // Создаем объект с параметрами
    let paymentData = {
        public_key: public_key,
        version: 3,
        action: "pay",
        amount: amount,
        currency: currency,
        description: description,
        order_id: order_id,
        result_url: window.location.href // Возврат на текущую страницу после оплаты
    };

    // Кодируем данные в base64
    let data = btoa(JSON.stringify(paymentData));

    // Генерация подписи с использованием SHA1
    let signString = private_key + data + private_key;
    let signature = CryptoJS.SHA1(signString).toString(CryptoJS.enc.Base64); // Используем SHA1

    // Открываем форму оплаты LiqPay
    let form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.liqpay.ua/api/3/checkout";
    form.target = "_blank";

    let inputData = document.createElement("input");
    inputData.type = "hidden";
    inputData.name = "data";
    inputData.value = data;

    let inputSignature = document.createElement("input");
    inputSignature.type = "hidden";
    inputSignature.name = "signature";
    inputSignature.value = signature;

    form.appendChild(inputData);
    form.appendChild(inputSignature);
    document.body.appendChild(form);
    form.submit();
}

// Добавляем обработчик на все кнопки "Купить"
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".buy-button").forEach(button => {
        button.addEventListener("click", function () {
            initiatePayment(button);
        });
    });
});
