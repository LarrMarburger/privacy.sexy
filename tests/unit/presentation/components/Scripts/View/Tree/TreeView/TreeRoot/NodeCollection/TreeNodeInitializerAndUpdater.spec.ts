import { describe, it, expect } from 'vitest';
import { TreeNodeInitializerAndUpdater } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeNodeInitializerAndUpdater';
import { TreeNodeNavigator } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/TreeNodeNavigator';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { createTreeNodeParserStub } from '@tests/unit/shared/Stubs/TreeNodeParserStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { TreeInputNodeDataStub } from '@tests/unit/shared/Stubs/TreeInputNodeDataStub';
import { QueryableNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/Query/QueryableNodes';
import { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';

describe('TreeNodeInitializerAndUpdater', () => {
  describe('updateRootNodes', () => {
    it('should throw an error if no data is provided', () => {
      itEachAbsentCollectionValue<TreeInputNodeData>((absentValue) => {
        // arrange
        const expectedError = 'missing data';
        const initializer = new TreeNodeInitializerAndUpdaterBuilder()
          .build();
        // act
        const act = () => initializer.updateRootNodes(absentValue);
        // expect
        expect(act).to.throw(expectedError);
      }, { excludeUndefined: true, excludeNull: true });
    });

    it('should update nodes when valid data is provided', () => {
      // arrange
      const expectedData = [new TreeNodeStub(), new TreeNodeStub()];
      const inputData = [new TreeInputNodeDataStub(), new TreeInputNodeDataStub()];
      const builder = new TreeNodeInitializerAndUpdaterBuilder();
      builder.parserStub.registerScenario({
        given: inputData,
        result: expectedData,
      });
      const initializer = builder.build();
      // act
      initializer.updateRootNodes(inputData);
      // assert
      expect(initializer.nodes).to.be.instanceOf(TreeNodeNavigator);
      expect(initializer.nodes.rootNodes).to.have.members(expectedData);
    });

    it('should notify when nodes are updated', () => {
      // arrange
      let notifiedNodes: QueryableNodes | undefined;
      const inputData = [new TreeInputNodeDataStub(), new TreeInputNodeDataStub()];
      const expectedData = [new TreeNodeStub(), new TreeNodeStub()];
      const builder = new TreeNodeInitializerAndUpdaterBuilder();
      builder.parserStub.registerScenario({
        given: inputData,
        result: expectedData,
      });
      const initializer = builder.build();
      initializer.nodesUpdated.on((nodes) => {
        notifiedNodes = nodes;
      });
      // act
      initializer.updateRootNodes(inputData);
      // assert
      expect(notifiedNodes).to.toBeTruthy();
      expect(initializer.nodes.rootNodes).to.have.members(expectedData);
    });
  });
});

class TreeNodeInitializerAndUpdaterBuilder {
  public readonly parserStub = createTreeNodeParserStub();

  public build() {
    return new TreeNodeInitializerAndUpdater(this.parserStub.parseTreeInputStub);
  }
}
