import { it, expect } from 'vitest';
import { Constructible } from '@tests/shared/TypeHelpers';

interface ISingletonTestData<T> {
  getter: () => T;
  expectedType: Constructible<T>;
}

export function itIsSingleton<T>(test: ISingletonTestData<T>): void {
  it('gets the expected type', () => {
    // act
    const instance = test.getter();
    // assert
    expect(instance).to.be.instanceOf(test.expectedType);
  });
  it('multiple calls get the same instance', () => {
    // act
    const instance1 = test.getter();
    const instance2 = test.getter();
    // assert
    expect(instance1).to.equal(instance2);
  });
}
