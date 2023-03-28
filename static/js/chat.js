let ws;

const messageInput = document.getElementById('message');
const recipientInput = document.getElementById('recipient');

const usernameInput = document.getElementById('username');
let username = "";

const chatWindow = document.querySelector('.chat-window');

const formUsername = document.querySelector('#form-username');
const formMessage = document.querySelector('#form-message');

function usenameSubmit(event) {
    event.preventDefault();

    username = usernameInput.value.trim();
    if (username === '') {
        alert('Пожалуйста, заполните ваше имя');
        return false;
    }
    usernameInput.disabled = true;
    document.getElementById("username-submit").disabled = true;

    ws = new WebSocket("ws://localhost:9000", "json");

    ws.onopen = () => {
        ws.send(JSON.stringify({
            action: "REG",
            src: username
        }))
        console.log('Клиент подключился к серверу WebSocket!');
    }
    
    ws.onmessage = function(event) {
        let jsonData = JSON.parse(event.data);
        let msg = jsonData.msg;
        switch (jsonData.action) {
        case "ERROR":
            alert(msg);
            break;
        case "SEND":
            receiveMessage(msg);
            break;
        case "STATUS_SENDING":
            sendMessage(msg);
            messageInput.value = ''; // Очищаем ввод сообщения
            break;
        }
        console.log('Получено сообщение от сервера: ', event.data);
    };
    
    ws.onclose = () => console.log('Соединение с сервером закрыто');
}

function setConnection() {

}

function messageSubmit(event) {
    event.preventDefault();

    if (!checkForSend()) {
        return;
    }

    const message = messageInput.value.trim();
    const recipient = recipientInput.value.trim();

    sendToServer(username, recipient, message);
}

function sendToServer(src, dst, msg) {
    ws.send(JSON.stringify({
        action: "SEND",
        src: src,
        dst: dst,
        msg: msg
    }))
    console.log("Сообщение %s отправлено серверу", msg)
}

function checkForSend() {
    if (usernameInput.value.trim() === '') {
        alert('Пожалуйста, заполните ваше имя');
        return false;
    }
    if (usernameInput.disabled === false) {
        alert('Пожалуйста, подтвердите ваше имя');
        return false;
    }

    const message = messageInput.value.trim();
    const recipient = recipientInput.value.trim();
    if (message === '' || recipient === '') {
        alert('Пожалуйста, заполните все поля');
        return false;
    }

    return true;
}

function sendMessage(message) {
    // Создаем сообщение
    const messageElem = document.createElement('li');
    messageElem.classList.add('message', 'sent');
    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageElem.appendChild(messageText);

    // Добавляем сообщение сверху окна чата
    chatWindow.prepend(messageElem);
}

function receiveMessage(message) {
    // Создаем сообщение
    const messageReceivedElem = document.createElement('li');
    messageReceivedElem.classList.add('message', 'received');
    const messageReceivedText = document.createElement('p');
    messageReceivedText.textContent = message;
    messageReceivedElem.appendChild(messageReceivedText);

    // Добавляем сообщение сверху окна чата
    chatWindow.prepend(messageReceivedElem);
}

formUsername.addEventListener('submit', usenameSubmit);
formMessage.addEventListener('submit', messageSubmit); // Добавляем обработчик на отправку сообщения