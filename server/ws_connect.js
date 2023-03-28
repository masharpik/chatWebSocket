let clients = [];
let nameId = new Map();

module.exports = function onConnect(wsClient) {

    wsClient.on('message', function(message) {
        let jsonMSG = JSON.parse(message);
        let src = jsonMSG.src;
        let dst = jsonMSG.dst;
        let msg = jsonMSG.msg;

        switch (jsonMSG.action) {
        case "REG":
            if (nameId.has(src)) {
                wsClient = clients[nameId.get(src) - 1];
                console.log('Клиент %d вернулся', wsClient.id);
                break;
            }
            connectClient(wsClient)
                .then(() => setUsername(src, wsClient.id)
                    .then(() => console.log('Соединение с клиентом %d (%s) установлено', nameId.get(src), src)));
            break;
        case "SEND":
            if (!nameId.has(dst)) {
                wsClient.send(JSON.stringify({
                    action: "ERROR",
                    msg: "Пользователя с именем " + dst + " не существует."
                }));
                console.log('Пользователь %d (%s) пытался отправить несуществующему  пользователю (%s)', wsClient.id, src, dst);
            } else {
                clients[nameId.get(dst) - 1].send(JSON.stringify({
                    action: "SEND",
                    src: src,
                    dst: dst,
                    msg: msg
                }));
                console.log('Пользователь %d (%s) отправил сообщение "%s" пользователю %d (%s)', wsClient.id, src, msg, nameId.get(dst), dst);
                wsClient.send(JSON.stringify({
                    action: "STATUS_SENDING",
                    src: src,
                    dst: dst,
                    msg: msg
                }));
                console.log('Сервер отправил пользователю %d (%s) сообщение "%s"', wsClient.id, src, msg);
            }
            break;
        }

        console.log('На сервере от %d получены данные: %s', wsClient.id, JSON.parse(message));
    });
    
    wsClient.on('close', () => {
        console.log('Соединение с клиентом %s закрыто', wsClient.id);
    });
};

async function connectClient(wsClient) {
    clients.push(wsClient);

    let idClient = clients.length;
    wsClient.id = idClient;
}

async function setUsername(username, id) {
    nameId.set(username, id);
}
