import { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { ArgumentCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/Argument/ArgumentCompiler';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { FunctionCallStub } from './FunctionCallStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class ArgumentCompilerStub
  extends StubWithObservableMethodCalls<ArgumentCompiler>
  implements ArgumentCompiler {
  private readonly scenarios = new Array<ArgumentCompilationScenario>();

  public createCompiledNestedCall(
    nestedFunctionCall: FunctionCall,
    parentFunctionCall: FunctionCall,
    context: FunctionCallCompilationContext,
  ): FunctionCall {
    this.registerMethodCall({
      methodName: 'createCompiledNestedCall',
      args: [nestedFunctionCall, parentFunctionCall, context],
    });
    const scenario = this.scenarios.find((s) => s.givenNestedFunctionCall === nestedFunctionCall);
    if (scenario) {
      return scenario.result;
    }
    return new FunctionCallStub();
  }

  public withScenario(scenario: ArgumentCompilationScenario): this {
    this.scenarios.push(scenario);
    return this;
  }
}

interface ArgumentCompilationScenario {
  readonly givenNestedFunctionCall: FunctionCall;
  readonly result: FunctionCall;
}
