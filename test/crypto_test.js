'use strict';

const assert = require("assert");
const Crypto = require("../lib/crypto");
const sjcl = require("sjcl");
const exception = require("../lib/exception");

describe("CryptoService", () => {
    const sut = new Crypto();
    const curve = "k256";

    describe("#getCurve", () => {
        it("should get a curve", () => {
            const c1 = sut.getCurve(curve);

            // todo: make some more tests
            assert.equal(c1, sjcl.ecc.curves.k256);
        });

        it("should return an exception if no curve that has the given name", () => {
            assert.throws(() => { sut.getCurve("invalid") }, exception.NoSuchCurve);
        });
    });

    describe("#getGen", () => {
        it("should get a generator", () => {
            const c = sut.getCurve(curve);
            const g = sut.getGen(c);

            assert.equal(g, sjcl.ecc.curves[curve].G);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getGen("invalid") }, exception.InvalidCurve);
        });
    });

    describe("#getRandomNumber", () => {
        it("should return a value that is not undefined", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getRandomNumber(c);
            assert(actual !== undefined);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getRandomNumber("invalid") }, exception.InvalidCurve);
        });
    });

    describe("#getPoint", () => {
        it("should return a point", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getPoint(c, 10, 10);
            assert.deepEqual(actual, new sjcl.ecc.point(c, new sjcl.bn(10), new sjcl.bn(10)));
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getPoint("invalid", 10, 10) }, exception.InvalidCurve);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            const c = sut.getCurve(curve);

            assert.throws(() => { sut.getPoint(c, "invalid", 10) }, exception.InvalidNumber);
            assert.throws(() => { sut.getPoint(c, 10, "invalid") }, exception.InvalidNumber);
            assert.throws(() => { sut.getPoint(c, "invalid", "invalid") }, exception.InvalidNumber);
        });
    });

    describe("#getRandomPoint", () => {
        it("should return a value that is not undefined", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getRandomPoint(c);
            assert(actual !== undefined);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getRandomPoint("invalid") }, exception.InvalidCurve);
        });
    });

    describe("#getUnitPoint", () => {
        it("should return a unit point", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getUnitPoint(c);
            assert.equal(actual.isIdentity, true);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getUnitPoint("invalid") }, exception.InvalidCurve);
        });
    });

    describe("#add", () => {
        it("should return the same point when add unit", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);
            const o = sut.getUnitPoint(c);

            const actual1 = sut.add(p, o);
            const actual2 = sut.add(o, p);

            assert.deepEqual(actual1, p);
            assert.deepEqual(actual2, p);
        });

        it("should return an exception if the point is not an instance of sjcl.ecc.point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            assert.throws(() => { sut.add("invalid", p); }, exception.InvalidPoint);
            assert.throws(() => { sut.add(p, "invalid"); }, exception.InvalidPoint);
            assert.throws(() => { sut.add("invalid", "invalid"); }, exception.InvalidPoint);
        });
    });

    describe("#multiply", () => {
        it("shuold return a value that is not undefined", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            assert(sut.multiply(p, 5) !== undefined);
        });

        it("should multiply a value to point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            const actual = sut.multiply(p, 5);
            assert.deepEqual(actual, p.mult(5));
        });

        it("should multiply a random value to point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);
            const r = sut.getRandomNumber(c);

            const actual = sut.multiply(p, r);
            assert.deepEqual(actual, p.mult(r));
        });
    });

    describe("#inversePoint", () => {
        it("should return a value that is not undefined", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            const actual = sut.inversePoint(p);
            assert(actual !== undefined);
        });

        it("should return an inverse point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            const actual = sut.inversePoint(p);
            assert.deepEqual(actual, p.negate());
        });

        it("should return a unit as a point plus its inverse", () => {
            const c = sut.getCurve(curve);
            const p = sut.getPoint(c, 5, 10);
            const pinv = sut.inversePoint(p);

            const actual = sut.add(p, pinv);
            assert.deepEqual(actual, sut.getUnitPoint(c));
        });

        it("should return an exception if the point is not instance of sjcl.ecc.point", () => {
            assert.throws(() => { sut.inversePoint("invalid"); }, exception.InvalidPoint);
        })
    });

    describe("#inverseNumber", () => {
        it("should return a value that is not undefined", () => {
            const c = sut.getCurve(curve);

            const actual = sut.inverseNumber(c, 5);
            assert(actual !== undefined);
        });

        it("should return a value that equals 1 when it multiplies the input number", () => {
            const c = sut.getCurve(curve);
            const n = new sjcl.bn(5);

            const actual = sut.inverseNumber(c, n);
            assert.deepEqual(actual.mulmod(n, c.r), new sjcl.bn(1));
        });

        it("should return a value that equals point P that it multiplies tha aP", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);
            const a = new sjcl.bn(5);
            const ap = sut.multiply(p, a);

            const actual = sut.inverseNumber(c, a);
            assert.deepEqual(sut.multiply(ap, actual).toBits(), p.toBits());
        });

        it("should return an exception if the input curve is not an instance of number nor sjcl.bn", () => {
            assert.throws(() => { sut.inverseNumber("invalid", 5); }, exception.InvalidCurve);
        });

        it("should return an exception if the input number is not a numeber", () => {
            const c = sut.getCurve(curve);

            assert.throws(() => { sut.inverseNumber(c, "invaild"); }, exception.InvalidNumber);
        });
    });

    describe("#equalsPoint", () => {
        it("should return true if the inputs are the same", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            assert(sut.equalsPoint(p, p));
        });

        it("should return false if the inputs are not the same", () => {
            const c = sut.getCurve(curve);
            const p1 = sut.getPoint(c, 10, 5);
            const p2 = sut.getPoint(c, 8, 6);

            assert(!(sut.equalsPoint(p1, p2)));
        });

        it("should return an exception if the inputs are not instance of sjcl.ecc.point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            assert.throws(() => { sut.equalsPoint("invalid", p); }, exception.InvalidPoint);
            assert.throws(() => { sut.equalsPoint(p, "invalid"); }, exception.InvalidPoint);
            assert.throws(() => { sut.equalsPoint("invalid", "invalid"); }, exception.InvalidPoint);
        })
    });
});