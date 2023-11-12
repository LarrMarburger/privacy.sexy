import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { IExpression } from '@/application/Parser/Script/Compiler/Expressions/Expression/IExpression';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { IExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';
import { FunctionParameterCollectionStub } from './FunctionParameterCollectionStub';

export class ExpressionStub implements IExpression {
  public callHistory = new Array<IExpressionEvaluationContext>();

  public position = new ExpressionPosition(0, 5);

  public parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub();

  private result = `[${ExpressionStub.name}] result`;

  public withParameters(parameters: IReadOnlyFunctionParameterCollection) {
    this.parameters = parameters;
    return this;
  }

  public withParameterNames(parameterNames: readonly string[], isOptional = false) {
    const collection = new FunctionParameterCollectionStub()
      .withParameterNames(parameterNames, isOptional);
    return this.withParameters(collection);
  }

  public withPosition(start: number, end: number) {
    this.position = new ExpressionPosition(start, end);
    return this;
  }

  public withEvaluatedResult(result: string) {
    this.result = result;
    return this;
  }

  public evaluate(context: IExpressionEvaluationContext): string {
    this.callHistory.push(context);
    if (this.result === undefined /* not empty string */) {
      const { args } = context;
      return `[expression-stub] args: ${args ? Object.keys(args).map((key) => `${key}: ${args[key]}`).join('", "') : 'none'}`;
    }
    return this.result;
  }
}
