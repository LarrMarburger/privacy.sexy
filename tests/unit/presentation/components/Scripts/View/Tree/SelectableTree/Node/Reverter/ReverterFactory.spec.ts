import 'mocha';
import { expect } from 'chai';
import { INode, NodeType } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/INode';
// tslint:disable-next-line:max-line-length
import { getReverter } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/Reverter/ReverterFactory';
import { ScriptReverter } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/Reverter/ScriptReverter';
import { CategoryReverter } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/Reverter/CategoryReverter';
// tslint:disable-next-line:max-line-length
import { getScriptNodeId, getCategoryNodeId } from '@/presentation/components/Scripts/View/ScriptsTree/ScriptNodeParser';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';
import { CategoryStub } from '@tests/unit/stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/stubs/ScriptStub';

describe('ReverterFactory', () => {
    describe('getReverter', () => {
        it('gets CategoryReverter for category node', () => {
            // arrange
            const category = new CategoryStub(0).withScriptIds('55');
            const node = getNodeStub(getCategoryNodeId(category), NodeType.Category);
            const collection = new CategoryCollectionStub()
                .withAction(category);
            // act
            const result = getReverter(node, collection);
            // assert
            expect(result instanceof CategoryReverter).to.equal(true);
        });
        it('gets ScriptReverter for script node', () => {
            // arrange
            const script = new ScriptStub('test');
            const node = getNodeStub(getScriptNodeId(script), NodeType.Script);
            const collection = new CategoryCollectionStub()
                .withAction(new CategoryStub(0).withScript(script));
            // act
            const result = getReverter(node, collection);
            // assert
            expect(result instanceof ScriptReverter).to.equal(true);
        });
    });
    function getNodeStub(nodeId: string, type: NodeType): INode {
        return {
            id: nodeId,
            text: 'text',
            isReversible: false,
            documentationUrls: [],
            children: [],
            type,
        };
    }
});
