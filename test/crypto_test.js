var assert = require('assert');
var crypto = require("../lib/crypto.js");
var sjcl = require('sjcl');

describe("Crypto", function () {
    var sut = new crypto();
    var curve = "k256";

    describe("#getCurve", function () {
        it("should get a curve", function () {
            var c1 = sut.getCurve(curve);

            // todo もっといろいろやる
            assert.equal(c1, sjcl.ecc.curves.k256)
        })
    });

    describe("#getGen", function () {
        it("should get a generator", function () {
            var c = sut.getCurve(curve);
            var g = sut.getGen(c);

            assert.equal(g, sjcl.ecc.curves[curve].G)
        })
    });

    describe("#getRandom", function () {
        it("should return a value that is not undefined", function () {
            var c = sut.getCurve(curve);

            var actual = sut.getRandom(c);

            assert(actual !== undefined);
        });
    });

    describe("#getRandomPoint", function () {
        it("should return a value that is not undefined", function () {
            var c = sut.getCurve(curve);

            var actual = sut.getRandomPoint(c);

            assert(actual !== undefined);
        })
    });

    describe("#getUnitPoint", function () {
        it("should return a unit point", function () {
            var c = sut.getCurve(curve);

            var actual = sut.getUnitPoint(c);

            assert.equal(actual.isIdentity, true);
        })
    });

    describe("#add", function () {
        it("should return the same point when add unit", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);
            var o = sut.getPoint(c);

            var actual1 = sut.add(p, o);
            var actual2 = sut.add(o, p);

            assert.deepEqual(actual1, p);
            assert.deepEqual(actual2, p);
        })
    });

    describe("#mul", function () {
        it("shuold return a value that is not undefined", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);

            assert(sut.mul(p, 5) !== undefined);
        });

        it("should multiply a value to point", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);

            var actual = sut.mul(p, 5);

            assert.deepEqual(actual, p.mult(5));
        });

        it("should multiply a random value to point", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);
            var r = sut.getRandom(c);

            var actual = sut.mul(p, r);

            assert.deepEqual(actual, p.mult(r));
        });
    });

    describe("#inv", function () {
        it("should return a value that is not undefined", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);

            var actual = sut.inv(p);

            assert(actual !== undefined);
        });

        it("should return an inverse point", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);

            var actual = sut.inv(p);

            assert.deepEqual(actual, p.negate());
        });

        it("should return a unit as a point plus its inverse", function () {
            var c = sut.getCurve(curve);
            var p = sut.getPoint(c, 5, 10);
            var pinv = sut.inv(p);

            var actual = sut.add(p, pinv);

            assert.deepEqual(actual, sut.getUnitPoint(c));
        });
    })
});