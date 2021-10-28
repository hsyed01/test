"use strict";
var calculator = require('../calculator');
describe('calculate', function () {
    it('add', function () {
        var result = calculator.add(5, 2);
        expect(result).toBe(7);
    });
});
