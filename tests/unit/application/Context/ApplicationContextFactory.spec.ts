import 'mocha';
import { expect } from 'chai';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { buildContext } from '@/application/Context/ApplicationContextFactory';
import { IApplicationFactory } from '@/application/IApplicationFactory';
import { IApplication } from '@/domain/IApplication';
import { EnvironmentStub } from '@tests/unit/stubs/EnvironmentStub';
import { ApplicationStub } from '@tests/unit/stubs/ApplicationStub';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';

describe('ApplicationContextFactory', () => {
  describe('buildContext', () => {
    describe('factory', () => {
      it('sets application from factory', async () => {
        // arrange
        const expected = new ApplicationStub().withCollection(
          new CategoryCollectionStub().withOs(OperatingSystem.macOS),
        );
        const factoryMock = mockFactoryWithApp(expected);
        // act
        const context = await buildContext(factoryMock);
        // assert
        expect(expected).to.equal(context.app);
      });
    });
    describe('environment', () => {
      describe('sets initial OS as expected', () => {
        it('returns currentOs if it is supported', async () => {
          // arrange
          const expected = OperatingSystem.Windows;
          const environment = new EnvironmentStub().withOs(expected);
          const collection = new CategoryCollectionStub().withOs(expected);
          const factoryMock = mockFactoryWithCollection(collection);
          // act
          const context = await buildContext(factoryMock, environment);
          // assert
          const actual = context.state.os;
          expect(expected).to.equal(actual);
        });
        it('fallbacks to other os if OS in environment is not supported', async () => {
          // arrange
          const expected = OperatingSystem.Windows;
          const currentOs = OperatingSystem.macOS;
          const environment = new EnvironmentStub().withOs(currentOs);
          const collection = new CategoryCollectionStub().withOs(expected);
          const factoryMock = mockFactoryWithCollection(collection);
          // act
          const context = await buildContext(factoryMock, environment);
          // assert
          const actual = context.state.os;
          expect(expected).to.equal(actual);
        });
        it('fallbacks to most supported os if current os is not supported', async () => {
          // arrange
          const expectedOs = OperatingSystem.Android;
          const allCollections = [
            new CategoryCollectionStub().withOs(OperatingSystem.Linux).withTotalScripts(3),
            new CategoryCollectionStub().withOs(expectedOs).withTotalScripts(5),
            new CategoryCollectionStub().withOs(OperatingSystem.Windows).withTotalScripts(4),
          ];
          const environment = new EnvironmentStub().withOs(OperatingSystem.macOS);
          const app = new ApplicationStub().withCollections(...allCollections);
          const factoryMock = mockFactoryWithApp(app);
          // act
          const context = await buildContext(factoryMock, environment);
          // assert
          const actual = context.state.os;
          expect(expectedOs).to.equal(actual, `Expected: ${OperatingSystem[expectedOs]}, actual: ${OperatingSystem[actual]}`);
        });
      });
    });
  });
});

function mockFactoryWithCollection(result: ICategoryCollection): IApplicationFactory {
  return mockFactoryWithApp(new ApplicationStub().withCollection(result));
}

function mockFactoryWithApp(app: IApplication): IApplicationFactory {
  return {
    getApp: () => Promise.resolve(app),
  };
}
