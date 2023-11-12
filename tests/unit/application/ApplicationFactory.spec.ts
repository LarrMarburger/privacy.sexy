import { describe, it, expect } from 'vitest';
import { ApplicationFactory, ApplicationGetterType } from '@/application/ApplicationFactory';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';

describe('ApplicationFactory', () => {
  describe('getApp', () => {
    it('returns result from the getter', async () => {
      // arrange
      const expected = new ApplicationStub();
      const getter: ApplicationGetterType = () => expected;
      const sut = new SystemUnderTest(getter);
      // act
      const actual = await Promise.all([
        sut.getApp(),
        sut.getApp(),
        sut.getApp(),
        sut.getApp(),
      ]);
      // assert
      expect(actual.every((value) => value === expected));
    });
    it('only executes getter once', async () => {
      // arrange
      let totalExecution = 0;
      const expected = new ApplicationStub();
      const getter: ApplicationGetterType = () => {
        totalExecution++;
        return expected;
      };
      const sut = new SystemUnderTest(getter);
      // act
      await Promise.all([
        sut.getApp(),
        sut.getApp(),
        sut.getApp(),
        sut.getApp(),
      ]);
      // assert
      expect(totalExecution).to.equal(1);
    });
  });
});

class SystemUnderTest extends ApplicationFactory {
  public constructor(costlyGetter: ApplicationGetterType) {
    super(costlyGetter);
  }
}
