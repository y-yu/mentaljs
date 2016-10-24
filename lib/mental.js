var sjcl = require("sjcl");
var simpleWebRTC = require("simplewebrtc")

function createRoom(roomName) {
    var webRTC = new simpleWebRTC({});
    webRTC.createRoom(roomName);

    return webRTC;
}

function joinRoom(roomName) {
    var webRTC = new simpleWebRTC({});
    try {
        webRTC.joinRoom(roomName);
    } catch(e) {
        console.log(e)
    }

    return webRTC;
}
