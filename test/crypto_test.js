'use strict';

const assert = require("assert");
const Crypto = require("../lib/crypto.js");
const sjcl = require("sjcl");

describe("Crypto", () => {
    const sut = new Crypto();
    const curve = "k256";

    describe("#getCurve", () => {
        it("should get a curve", () => {
            const c1 = sut.getCurve(curve);

            // todo: make some more tests
            assert.equal(c1, sjcl.ecc.curves.k256);
        });

        it("should return an exception if no curve that has the given name", () => {
            assert.throws(() => { sut.getCurve("invalid") }, sut.exceptions.NoSuchCurve);
        });
    });

    describe("#getGen", () => {
        it("should get a generator", () => {
            const c = sut.getCurve(curve);
            const g = sut.getGen(c);

            assert.equal(g, sjcl.ecc.curves[curve].G);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getGen("invalid") }, sut.exceptions.InvalidCurve);
        });
    });

    describe("#getRandom", () => {
        it("should return a value that is not undefined", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getRandom(c);
            assert(actual !== undefined);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getRandom("invalid") }, sut.exceptions.InvalidCurve);
        });
    });

    describe("#getPoint", () => {
        it("should return a point", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getPoint(c, 10, 10);
            assert.deepEqual(actual, new sjcl.ecc.point(c, new sjcl.bn(10), new sjcl.bn(10)));
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getPoint("invalid", 10, 10) }, sut.exceptions.InvalidCurve);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            const c = sut.getCurve(curve);

            assert.throws(() => { sut.getPoint(c, "invalid", 10) }, sut.exceptions.InvalidNumber);
            assert.throws(() => { sut.getPoint(c, 10, "invalid") }, sut.exceptions.InvalidNumber);
            assert.throws(() => { sut.getPoint(c, "invalid", "invalid") }, sut.exceptions.InvalidNumber);
        });
    });

    describe("#getRandomPoint", () => {
        it("should return a value that is not undefined", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getRandomPoint(c);
            assert(actual !== undefined);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getRandomPoint("invalid") }, sut.exceptions.InvalidCurve);
        });
    });

    describe("#getUnitPoint", () => {
        it("should return a unit point", () => {
            const c = sut.getCurve(curve);

            const actual = sut.getUnitPoint(c);
            assert.equal(actual.isIdentity, true);
        });

        it("should throw an exception if the curve is not an instance of sjcl.ecc.curve", () => {
            assert.throws(() => { sut.getUnitPoint("invalid") }, sut.exceptions.InvalidCurve);
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

            assert.throws(() => { sut.add("invalid", p); }, sut.exceptions.InvalidPoint);
            assert.throws(() => { sut.add(p, "invalid"); }, sut.exceptions.InvalidPoint);
            assert.throws(() => { sut.add("invalid", "invalid"); }, sut.exceptions.InvalidPoint);
        });
    });

    describe("#mul", () => {
        it("shuold return a value that is not undefined", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            assert(sut.mul(p, 5) !== undefined);
        });

        it("should multiply a value to point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            const actual = sut.mul(p, 5);
            assert.deepEqual(actual, p.mult(5));
        });

        it("should multiply a random value to point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);
            const r = sut.getRandom(c);

            const actual = sut.mul(p, r);
            assert.deepEqual(actual, p.mult(r));
        });
    });

    describe("#inv", () => {
        it("should return a value that is not undefined", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            const actual = sut.inv(p);
            assert(actual !== undefined);
        });

        it("should return an inverse point", () => {
            const c = sut.getCurve(curve);
            const p = sut.getRandomPoint(c);

            const actual = sut.inv(p);
            assert.deepEqual(actual, p.negate());
        });

        it("should return a unit as a point plus its inverse", () => {
            const c = sut.getCurve(curve);
            const p = sut.getPoint(c, 5, 10);
            const pinv = sut.inv(p);

            const actual = sut.add(p, pinv);
            assert.deepEqual(actual, sut.getUnitPoint(c));
        });

        it("should return an exception if the point is not instance of sjcl.ecc.point", () => {
            assert.throws(() => { sut.inv("invalid"); }, sut.exceptions.InvalidPoint);
        })
    })
});