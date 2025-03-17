document.addEventListener("DOMContentLoaded", () => {
    // Оплата уроков через LiqPay
    function handlePayment(lessonPage) {
        if (!lessonPage) {
            alert("Выберите урок перед оплатой!");
            return;
        }

        fetch("/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lesson: lessonPage })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.payment_url;
            } else {
                alert("Ошибка при создании платежа.");
            }
        })
        .catch(error => console.error("Ошибка:", error));
    }

    const payButton = document.getElementById("payButton");
    const lessonSelect = document.getElementById("lessonSelect");
    const buyButtons = document.querySelectorAll(".buy-button");

    if (payButton && lessonSelect) {
        payButton.addEventListener("click", () => {
            handlePayment(`${lessonSelect.value}.html`);
        });
    }

    buyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const lessonPage = button.getAttribute("data-lesson");
            handlePayment(lessonPage);
        });
    });

    // Проверка доступа к уроку
    const currentLesson = window.location.pathname.split("/").pop();
    const isPaidLesson = currentLesson && currentLesson.match(/^lesson[3-9]\.html$/) && !localStorage.getItem(currentLesson);

    if (isPaidLesson) {
        alert("Этот урок платный. Пожалуйста, оплатите доступ.");
        window.location.href = "index.html"; // Возвращаем на главную страницу
    }

    // Прелоадер
    const preloader = document.getElementById("preloader");
    if (preloader) {
        setTimeout(() => {
            preloader.style.display = "none";
        }, 2000);
    }

    // Чат
    const chatBox = document.getElementById("chat-box");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

    if (chatBox && chatInput && sendBtn) {
        sendBtn.addEventListener("click", function () {
            let message = chatInput.value.trim();
            if (message) {
                let newMessage = document.createElement("div");
                newMessage.textContent = message;
                newMessage.style.padding = "5px";
                newMessage.style.margin = "5px 0";
                newMessage.style.background = "#f8f3e7";
                newMessage.style.borderRadius = "5px";
                chatBox.appendChild(newMessage);
                chatInput.value = "";
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        });

        chatInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") sendBtn.click();
        });
    }

    // Очистка чата
    const clearBtn = document.getElementById("clear-btn");
    if (clearBtn && chatBox) {
        clearBtn.addEventListener("click", () => {
            chatBox.innerHTML = "";
        });
    }
});
