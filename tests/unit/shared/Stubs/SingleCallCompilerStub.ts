import { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { SingleCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/SingleCallCompiler';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';
import { CompiledCodeStub } from './CompiledCodeStub';

interface CallCompilationScenario {
  readonly givenCall: FunctionCall;
  readonly result: CompiledCode[];
}

export class SingleCallCompilerStub
  extends StubWithObservableMethodCalls<SingleCallCompiler>
  implements SingleCallCompiler {
  private readonly callCompilationScenarios = new Array<CallCompilationScenario>();

  public withCallCompilationScenarios(scenarios: Map<FunctionCall, CompiledCode[]>): this {
    for (const [call, result] of scenarios) {
      this.withCallCompilationScenario({
        givenCall: call,
        result,
      });
    }
    return this;
  }

  public withCallCompilationScenario(scenario: CallCompilationScenario): this {
    this.callCompilationScenarios.push(scenario);
    return this;
  }

  public compileSingleCall(
    call: FunctionCall,
    context: FunctionCallCompilationContext,
  ): CompiledCode[] {
    this.registerMethodCall({
      methodName: 'compileSingleCall',
      args: [call, context],
    });
    const callCompilation = this.callCompilationScenarios.find((s) => s.givenCall === call);
    if (callCompilation) {
      return callCompilation.result;
    }
    return [new CompiledCodeStub()];
  }
}
