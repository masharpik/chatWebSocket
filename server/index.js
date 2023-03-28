const express = require("express"); // Подключаем фреймворк экспресс для сервера
const app = express(); // создаём сервер

const path = require('path'); // Подключаем фреймворк path для путей
const static_dir = path.resolve(__dirname, '../static'); // Указываем, где статические файлы
app.use('/', express.static(static_dir));

const WebSocketServer = require('ws'); // Подключение модуля ws
const ws_data = require('./ws_connect'); // Получение обработчика на подключение сервера

const wsServer = new WebSocketServer.Server({port: 9000}, () => {
  console.log("WebSocketServer is running on port 9000");
}); // Создание сервера WebSocket
wsServer.on('connection', ws_data);

app.get('/', function(req, res) {
  res.sendFile(path.join(static_dir, 'template/chat.html'));
});

app.listen(3000, () => {
  // включаем сервер на порте 3000
  console.log("Server is running on port 3000");
});
