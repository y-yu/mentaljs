(function () {
    'use strict';

    var constructor = require("../lib/mental.js");
    var mentaljs = constructor("enxnz2an1739dx6r", true);

    var key = location.hash.slice(1);
    if (key === "") {
        console.log("the key is empty");
        var dataStream = mentaljs.makeRoom();

        dataStream.log();
    } else {
        console.log(key);
        mentaljs.joinRoom(key).log();
    }
})();