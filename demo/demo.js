(function () {
    'use strict';

    var constructor = require("../lib/mentaljs.js");
    var mentaljs = constructor("enxnz2an1739dx6r", true);

    var key = location.hash.slice(1);
    if (key === "") {
        console.log("the key is empty");
        var result = mentaljs.makeRoom();
    } else {
        console.log(key);
        mentaljs.joinRoom(key).then(function (result) {
            console.log("result:" + result);
        });
    }

})();