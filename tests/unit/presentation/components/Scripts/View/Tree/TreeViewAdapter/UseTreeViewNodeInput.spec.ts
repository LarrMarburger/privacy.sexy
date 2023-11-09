import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { WatchSource, ref, nextTick } from 'vue';
import { CategoryNodeParser, useTreeViewNodeInput } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/UseTreeViewNodeInput';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { CategoryCollectionStateStub } from '@tests/unit/shared/Stubs/CategoryCollectionStateStub';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import { NodeMetadataStub } from '@tests/unit/shared/Stubs/NodeMetadataStub';
import { convertToNodeInput } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/TreeNodeMetadataConverter';
import { TreeInputNodeDataStub as TreeInputNodeData, TreeInputNodeDataStub } from '@tests/unit/shared/Stubs/TreeInputNodeDataStub';

describe('useTreeViewNodeInput', () => {
  describe('when given categoryId', () => {
    it('sets input nodes correctly', async () => {
      // arrange
      const testCategoryId = ref<number | undefined>();
      const {
        useStateStub, returnObject, parserMock, converterMock,
      } = mountWrapperComponent(
        () => testCategoryId.value,
      );
      const expectedCategoryId = 123;
      const expectedCategoryCollection = new CategoryCollectionStub().withAction(
        new CategoryStub(expectedCategoryId),
      );
      const expectedMetadata = [new NodeMetadataStub(), new NodeMetadataStub()];
      parserMock.setupParseSingleScenario({
        givenId: expectedCategoryId,
        givenCollection: expectedCategoryCollection,
        parseResult: expectedMetadata,
      });
      const expectedNodeInputData = [new TreeInputNodeDataStub(), new TreeInputNodeDataStub()];
      expectedMetadata.forEach((metadata, index) => {
        converterMock.setupConversionScenario({
          givenMetadata: metadata,
          convertedNode: expectedNodeInputData[index],
        });
      });
      useStateStub.withState(
        new CategoryCollectionStateStub().withCollection(expectedCategoryCollection),
      );
      // act
      const { treeViewInputNodes } = returnObject;
      testCategoryId.value = expectedCategoryId;
      await nextTick();
      // assert
      const actualInputNodes = treeViewInputNodes.value;
      expect(actualInputNodes).have.lengthOf(expectedNodeInputData.length);
      expect(actualInputNodes).include.members(expectedNodeInputData);
    });
  });

  describe('when not given a categoryId', () => {
    it('sets input nodes correctly', () => {
      // arrange
      const testCategoryId = ref<number | undefined>();
      const {
        useStateStub, returnObject, parserMock, converterMock,
      } = mountWrapperComponent(
        () => testCategoryId.value,
      );
      const expectedCategoryCollection = new CategoryCollectionStub().withAction(
        new CategoryStub(123),
      );
      const expectedMetadata = [new NodeMetadataStub(), new NodeMetadataStub()];
      parserMock.setupParseAllScenario({
        givenCollection: expectedCategoryCollection,
        parseResult: expectedMetadata,
      });
      const expectedNodeInputData = [new TreeInputNodeDataStub(), new TreeInputNodeDataStub()];
      expectedMetadata.forEach((metadata, index) => {
        converterMock.setupConversionScenario({
          givenMetadata: metadata,
          convertedNode: expectedNodeInputData[index],
        });
      });
      useStateStub.withState(
        new CategoryCollectionStateStub().withCollection(expectedCategoryCollection),
      );
      // act
      const { treeViewInputNodes } = returnObject;
      testCategoryId.value = undefined;
      // assert
      const actualInputNodes = treeViewInputNodes.value;
      expect(actualInputNodes).have.lengthOf(expectedNodeInputData.length);
      expect(actualInputNodes).include.members(expectedNodeInputData);
    });
  });
});

function mountWrapperComponent(categoryIdWatcher: WatchSource<number | undefined>) {
  const useStateStub = new UseCollectionStateStub();
  const parserMock = mockCategoryNodeParser();
  const converterMock = mockConverter();
  let returnObject: ReturnType<typeof useTreeViewNodeInput>;

  shallowMount({
    setup() {
      returnObject = useTreeViewNodeInput(categoryIdWatcher, parserMock.mock, converterMock.mock);
    },
    template: '<div></div>',
  }, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]: () => useStateStub.get(),
      },
    },
  });

  return {
    returnObject,
    useStateStub,
    parserMock,
    converterMock,
  };
}

interface ConversionScenario {
  readonly givenMetadata: NodeMetadata;
  readonly convertedNode: TreeInputNodeData;
}

function mockConverter() {
  const scenarios = new Array<ConversionScenario>();

  const mock: typeof convertToNodeInput = (metadata) => {
    const scenario = scenarios.find((s) => s.givenMetadata === metadata);
    if (scenario) {
      return scenario.convertedNode;
    }
    return new TreeInputNodeData();
  };

  function setupConversionScenario(scenario: ConversionScenario) {
    scenarios.push(scenario);
  }

  return {
    mock,
    setupConversionScenario,
  };
}

interface ParseSingleScenario {
  readonly givenId: number;
  readonly givenCollection: ICategoryCollection;
  readonly parseResult: NodeMetadata[];
}

interface ParseAllScenario {
  readonly givenCollection: ICategoryCollection;
  readonly parseResult: NodeMetadata[];
}

function mockCategoryNodeParser() {
  const parseSingleScenarios = new Array<ParseSingleScenario>();

  const parseAllScenarios = new Array<ParseAllScenario>();

  const mock: CategoryNodeParser = {
    parseSingle: (id, collection) => {
      const scenario = parseSingleScenarios
        .find((s) => s.givenId === id && s.givenCollection === collection);
      if (scenario) {
        return scenario.parseResult;
      }
      return [];
    },
    parseAll: (collection) => {
      const scenario = parseAllScenarios
        .find((s) => s.givenCollection === collection);
      if (scenario) {
        return scenario.parseResult;
      }
      return [];
    },
  };

  function setupParseSingleScenario(scenario: ParseSingleScenario) {
    parseSingleScenarios.push(scenario);
  }

  function setupParseAllScenario(scenario: ParseAllScenario) {
    parseAllScenarios.push(scenario);
  }

  return {
    mock,
    setupParseAllScenario,
    setupParseSingleScenario,
  };
}
