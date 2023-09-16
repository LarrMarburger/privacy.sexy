import { CodeSegmentMerger } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CodeSegmentJoin/CodeSegmentMerger';
import { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { CompiledCodeStub } from './CompiledCodeStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class CodeSegmentMergerStub
  extends StubWithObservableMethodCalls<CodeSegmentMerger>
  implements CodeSegmentMerger {
  public mergeCodeParts(codeSegments: readonly CompiledCode[]): CompiledCode {
    this.registerMethodCall({
      methodName: 'mergeCodeParts',
      args: [codeSegments],
    });
    return new CompiledCodeStub();
  }
}
