const Mentaljs = require("../lib/mental");
const mentaljs = (new Mentaljs("enxnz2an1739dx6r", true)).core;

const key = location.hash.slice(1);
if (key === "") {
    console.log("the key is empty");
    const [messageStream, roomStream] = mentaljs.makeRoom();

    roomStream.onValue((room) => {
        $("#playerTableBody").empty();

        room.players.forEach((p) => {
            $("#playerTableBody").append(
                $("<tr>").append(
                    $("<td>").text(p.key)
                )
            )
        });
    });

    messageStream.onValue((receivedMessage) => {
        $("#messageTableBody").append(
            $("<tr>").append(
                $("<td>").text(receivedMessage.message.type),
                $("<td>").text(JSON.stringify(receivedMessage.message.body))
            )
        )
    });
} else {
    const [messageStream, roomStream] = mentaljs.joinRoom(key);

    roomStream.onValue((room) => {
        $("#playerTableBody").empty();

        room.players.forEach((p) => {
            $("#playerTableBody").append(
                $("<tr>").append(
                    $("<td>").text(p.key)
                )
            )
        });
    });

    messageStream.onValue((receivedMessage) => {
        $("#messageTableBody").append(
            $("<tr>").append(
                $("<td>").text(receivedMessage.message.type),
                $("<td>").text(JSON.stringify(receivedMessage.message.body))
            )
        )
    });
}
