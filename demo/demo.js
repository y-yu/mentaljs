const constructor = require("../lib/mental.js");
const mentaljs = constructor("enxnz2an1739dx6r", true);

const key = location.hash.slice(1);
if (key === "") {
    console.log("the key is empty");
    const messageRoomStream = mentaljs.makeRoom();
    messageRoomStream.log();
} else {
    console.log(key);
    mentaljs.joinRoom(key).log();
}
