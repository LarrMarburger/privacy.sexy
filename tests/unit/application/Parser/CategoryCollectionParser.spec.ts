import { describe, it, expect } from 'vitest';
import { IEntity } from '@/infrastructure/Entity/IEntity';
import { parseCategoryCollection } from '@/application/Parser/CategoryCollectionParser';
import { parseCategory } from '@/application/Parser/CategoryParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ScriptingDefinitionParser } from '@/application/Parser/ScriptingDefinition/ScriptingDefinitionParser';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ProjectInformationStub } from '@tests/unit/shared/Stubs/ProjectInformationStub';
import { getCategoryStub, CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { CategoryCollectionParseContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionParseContextStub';
import { CategoryDataStub } from '@tests/unit/shared/Stubs/CategoryDataStub';
import { createScriptDataWithCall, createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { CategoryData } from '@/application/collections/';

describe('CategoryCollectionParser', () => {
  describe('parseCategoryCollection', () => {
    describe('actions', () => {
      describe('throws with absent actions', () => {
        itEachAbsentCollectionValue<CategoryData>((absentValue) => {
          // arrange
          const expectedError = 'content does not define any action';
          const collection = new CollectionDataStub()
            .withActions(absentValue);
          const info = new ProjectInformationStub();
          // act
          const act = () => parseCategoryCollection(collection, info);
          // assert
          expect(act).to.throw(expectedError);
        }, { excludeUndefined: true, excludeNull: true });
      });
      it('parses actions', () => {
        // arrange
        const actions = [getCategoryStub('test1'), getCategoryStub('test2')];
        const context = new CategoryCollectionParseContextStub();
        const expected = [parseCategory(actions[0], context), parseCategory(actions[1], context)];
        const collection = new CollectionDataStub()
          .withActions(actions);
        const info = new ProjectInformationStub();
        // act
        const actual = parseCategoryCollection(collection, info).actions;
        // assert
        expect(excludingId(actual)).to.be.deep.equal(excludingId(expected));
        function excludingId<TId>(array: ReadonlyArray<IEntity<TId>>) {
          return array.map((obj) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: omitted, ...rest } = obj;
            return rest;
          });
        }
      });
    });
    describe('scripting definition', () => {
      it('parses scripting definition as expected', () => {
        // arrange
        const collection = new CollectionDataStub();
        const information = new ProjectInformationStub();
        const expected = new ScriptingDefinitionParser()
          .parse(collection.scripting, information);
        // act
        const actual = parseCategoryCollection(collection, information).scripting;
        // assert
        expect(expected).to.deep.equal(actual);
      });
    });
    describe('os', () => {
      it('parses as expected', () => {
        // arrange
        const expectedOs = OperatingSystem.macOS;
        const osText = 'macos';
        const expectedName = 'os';
        const collection = new CollectionDataStub()
          .withOs(osText);
        const parserMock = new EnumParserStub<OperatingSystem>()
          .setup(expectedName, osText, expectedOs);
        const info = new ProjectInformationStub();
        // act
        const actual = parseCategoryCollection(collection, info, parserMock);
        // assert
        expect(actual.os).to.equal(expectedOs);
      });
    });
    describe('functions', () => {
      it('compiles script call with given function', () => {
        // arrange
        const expectedCode = 'code-from-the-function';
        const functionName = 'function-name';
        const scriptName = 'script-name';
        const script = createScriptDataWithCall()
          .withCall(new FunctionCallDataStub().withName(functionName).withParameters({}))
          .withName(scriptName);
        const func = createFunctionDataWithCode()
          .withParametersObject([])
          .withName(functionName)
          .withCode(expectedCode);
        const category = new CategoryDataStub()
          .withChildren([script,
            createScriptDataWithCode().withName('2')
              .withRecommendationLevel(RecommendationLevel.Standard),
            createScriptDataWithCode()
              .withName('3').withRecommendationLevel(RecommendationLevel.Strict),
          ]);
        const collection = new CollectionDataStub()
          .withActions([category])
          .withFunctions([func]);
        const info = new ProjectInformationStub();
        // act
        const actual = parseCategoryCollection(collection, info);
        // assert
        const actualScript = actual.getScript(scriptName);
        const actualCode = actualScript.code.execute;
        expect(actualCode).to.equal(expectedCode);
      });
    });
  });
});
