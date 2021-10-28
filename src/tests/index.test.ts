const calculator = require('../calculator');

describe('calculate', function() {
  it('add', function() {
    let result = calculator.add(5, 2);
    expect(result).toBe(7);   
  })
})
