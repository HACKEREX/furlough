import { LossCalculatorPipe } from './loss-calculator.pipe';

describe('LossCalculatorPipe', () => {
  it('create an instance', () => {
    const pipe = new LossCalculatorPipe();
    expect(pipe).toBeTruthy();
  });
});
