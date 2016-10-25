var assert = require("assert");
var Crypto = require("../lib/crypto.js");
var sjcl = require("sjcl");

describe("Crypto", function () {
    var sut = new Crypto();
    var curve = "k256";

    describe("#getCurve", function () {
        it("should get a curve", function () {
            var c1 = sut.getCurve(curve);

            // todo: make some more tests
            assert.equal(c1, sjcl.ecc.curves.k256);
        });

        it("should return an exception if no curve that has the given name", function () {
            assert.throws(function () { sut.getCurve("invalid") }, sut.exceptions.NoSuchCurve);
        });
    });

    describe("#getGen", function () {
        it("should get a generator", function () {
            var c = sut.getCurve(curve);
            var g = sut.getGen(c);

            assert.equal(g, sjcl.ecc.curves[curve].G);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", function () {
            assert.throws(function () { sut.getGen("invalid") }, sut.exceptions.InvalidCurve);
        });
    });

    describe("#getRandom", function () {
        it("should return a value that is not undefined", function () {
            var c = sut.getCurve(curve);

            var actual = sut.getRandom(c);

            assert(actual !== undefined);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", function () {
            assert.throws(function () { sut.getRandom("invalid") }, sut.exceptions.InvalidCurve);
        });
    });

    describe("#getPoint", function () {
        it("should return a point", function () {
            var c = sut.getCurve(curve);

            var actual = sut.getPoint(c, 10, 10);

            assert.deepEqual(actual, new sjcl.ecc.point(c, new sjcl.bn(10), new sjcl.bn(10)));
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", function () {
            assert.throws(function () { sut.getPoint("invalid", 10, 10) }, sut.exceptions.InvalidCurve);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", function () {
            var c = sut.getCurve(curve);

            assert.throws(function () { sut.getPoint(c, "invalid", 10) }, sut.exceptions.InvalidNumber);
            assert.throws(function () { sut.getPoint(c, 10, "invalid") }, sut.exceptions.InvalidNumber);
            assert.throws(function () { sut.getPoint(c, "invalid", "invalid") }, sut.exceptions.InvalidNumber);
        });
    });

    describe("#getRandomPoint", function () {
        it("should return a value that is not undefined", function () {
            var c = sut.getCurve(curve);

            var actual = sut.getRandomPoint(c);

            assert(actual !== undefined);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", function () {
            assert.throws(function () { sut.getRandomPoint("invalid") }, sut.exceptions.InvalidCurve);
        });
    });

    describe("#getUnitPoint", function () {
        it("should return a unit point", function () {
            var c = sut.getCurve(curve);

            var actual = sut.getUnitPoint(c);

            assert.equal(actual.isIdentity, true);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", function () {
            assert.throws(function () { sut.getUnitPoint("invalid") }, sut.exceptions.InvalidCurve);
        });
    });

    describe("#add", function () {
        it("should return the same point when add unit", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);
            var o = sut.getUnitPoint(c);

            var actual1 = sut.add(p, o);
            var actual2 = sut.add(o, p);

            assert.deepEqual(actual1, p);
            assert.deepEqual(actual2, p);
        });

        it("should return an exception if the point is not an instance of sjcl.ecc.point", function () {
            var c = sut.getCurve(curve);
            var p = sut.getRandomPoint(c);

            assert.throws(function () { sut.add("invalid", p); }, sut.exceptions.InvalidPoint);
            assert.throws(function () { sut.add(p, "invalid"); }, sut.exceptions.InvalidPoint);
            assert.throws(function () { sut.add("invalid", "invalid"); }, sut.exceptions.InvalidPoint);
        });
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

        it("should return an exception if the point is not instance of sjcl.ecc.point", function () {
            assert.throws(function () { sut.inv("invalid"); }, sut.exceptions.InvalidPoint);
        })
    })
});