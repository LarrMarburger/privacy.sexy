import { describe, it, expect } from 'vitest';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { ExpressionEvaluator, Expression } from '@/application/Parser/Script/Compiler/Expressions/Expression/Expression';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import { FunctionCallArgumentStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentStub';
import { ExpressionEvaluationContextStub } from '@tests/unit/shared/Stubs/ExpressionEvaluationContextStub';
import { IPipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/IPipelineCompiler';
import { PipelineCompilerStub } from '@tests/unit/shared/Stubs/PipelineCompilerStub';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { getAbsentObjectTestCases, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { IExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';

describe('Expression', () => {
  describe('ctor', () => {
    describe('position', () => {
      describe('throws when missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing position';
          const position = absentValue;
          // act
          const act = () => new ExpressionBuilder()
            .withPosition(position)
            .build();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      it('sets as expected', () => {
        // arrange
        const expected = new ExpressionPosition(0, 5);
        // act
        const actual = new ExpressionBuilder()
          .withPosition(expected)
          .build();
        // assert
        expect(actual.position).to.equal(expected);
      });
    });
    describe('parameters', () => {
      describe('defaults to empty array if absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const parameters = absentValue;
          // act
          const actual = new ExpressionBuilder()
            .withParameters(parameters)
            .build();
          // assert
          expect(actual.parameters);
          expect(actual.parameters.all);
          expect(actual.parameters.all.length).to.equal(0);
        });
      });
      it('sets as expected', () => {
        // arrange
        const expected = new FunctionParameterCollectionStub()
          .withParameterName('firstParameterName')
          .withParameterName('secondParameterName');
        // act
        const actual = new ExpressionBuilder()
          .withParameters(expected)
          .build();
        // assert
        expect(actual.parameters).to.deep.equal(expected);
      });
    });
    describe('evaluator', () => {
      describe('throws if missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing evaluator';
          const evaluator = absentValue;
          // act
          const act = () => new ExpressionBuilder()
            .withEvaluator(evaluator)
            .build();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
  });
  describe('evaluate', () => {
    describe('throws with invalid arguments', () => {
      const testCases: readonly {
        name: string,
        context: IExpressionEvaluationContext,
        expectedError: string,
        sutBuilder?: (builder: ExpressionBuilder) => ExpressionBuilder,
      }[] = [
        ...getAbsentObjectTestCases().map((testCase) => ({
          name: `throws if arguments is ${testCase.valueName}`,
          context: testCase.absentValue,
          expectedError: 'missing context',
        })),
        {
          name: 'throws when some of the required args are not provided',
          sutBuilder: (i: ExpressionBuilder) => i.withParameterNames(['a', 'b', 'c'], false),
          context: new ExpressionEvaluationContextStub()
            .withArgs(new FunctionCallArgumentCollectionStub().withArgument('b', 'provided')),
          expectedError: 'argument values are provided for required parameters: "a", "c"',
        },
        {
          name: 'throws when none of the required args are not provided',
          sutBuilder: (i: ExpressionBuilder) => i.withParameterNames(['a', 'b'], false),
          context: new ExpressionEvaluationContextStub()
            .withArgs(new FunctionCallArgumentCollectionStub().withArgument('c', 'unrelated')),
          expectedError: 'argument values are provided for required parameters: "a", "b"',
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          // arrange
          const sutBuilder = new ExpressionBuilder();
          if (testCase.sutBuilder) {
            testCase.sutBuilder(sutBuilder);
          }
          const sut = sutBuilder.build();
          // act
          const act = () => sut.evaluate(testCase.context);
          // assert
          expect(act).to.throw(testCase.expectedError);
        });
      }
    });
    it('returns result from evaluator', () => {
      // arrange
      const evaluatorMock: ExpressionEvaluator = (c) => `"${c
        .args
        .getAllParameterNames()
        .map((name) => context.args.getArgument(name))
        .map((arg) => `${arg.parameterName}': '${arg.argumentValue}'`)
        .join('", "')}"`;
      const givenArguments = new FunctionCallArgumentCollectionStub()
        .withArgument('parameter1', 'value1')
        .withArgument('parameter2', 'value2');
      const expectedParameterNames = givenArguments.getAllParameterNames();
      const context = new ExpressionEvaluationContextStub()
        .withArgs(givenArguments);
      const expected = evaluatorMock(context);
      const sut = new ExpressionBuilder()
        .withEvaluator(evaluatorMock)
        .withParameterNames(expectedParameterNames)
        .build();
      // arrange
      const actual = sut.evaluate(context);
      // assert
      expect(expected).to.equal(actual, printMessage());
      function printMessage(): string {
        return `\nGiven arguments: ${JSON.stringify(givenArguments)}\n`
          + `\nExpected parameter names: ${JSON.stringify(expectedParameterNames)}\n`;
      }
    });
    it('sends pipeline compiler as it is', () => {
      // arrange
      const expected = new PipelineCompilerStub();
      const context = new ExpressionEvaluationContextStub()
        .withPipelineCompiler(expected);
      let actual: IPipelineCompiler;
      const evaluatorMock: ExpressionEvaluator = (c) => {
        actual = c.pipelineCompiler;
        return '';
      };
      const sut = new ExpressionBuilder()
        .withEvaluator(evaluatorMock)
        .build();
      // arrange
      sut.evaluate(context);
      // assert
      expect(expected).to.equal(actual);
    });
    describe('filters unused parameters', () => {
      // arrange
      const testCases = [
        {
          name: 'with a provided argument',
          expressionParameters: new FunctionParameterCollectionStub()
            .withParameterName('parameterToHave', false),
          arguments: new FunctionCallArgumentCollectionStub()
            .withArgument('parameterToHave', 'value-to-have')
            .withArgument('parameterToIgnore', 'value-to-ignore'),
          expectedArguments: [
            new FunctionCallArgumentStub()
              .withParameterName('parameterToHave').withArgumentValue('value-to-have'),
          ],
        },
        {
          name: 'without a provided argument',
          expressionParameters: new FunctionParameterCollectionStub()
            .withParameterName('parameterToHave', false)
            .withParameterName('parameterToIgnore', true),
          arguments: new FunctionCallArgumentCollectionStub()
            .withArgument('parameterToHave', 'value-to-have'),
          expectedArguments: [
            new FunctionCallArgumentStub()
              .withParameterName('parameterToHave').withArgumentValue('value-to-have'),
          ],
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          let actual: IReadOnlyFunctionCallArgumentCollection;
          const evaluatorMock: ExpressionEvaluator = (c) => {
            actual = c.args;
            return '';
          };
          const context = new ExpressionEvaluationContextStub()
            .withArgs(testCase.arguments);
          const sut = new ExpressionBuilder()
            .withEvaluator(evaluatorMock)
            .withParameters(testCase.expressionParameters)
            .build();
          // act
          sut.evaluate(context);
          // assert
          const actualArguments = actual.getAllParameterNames()
            .map((name) => actual.getArgument(name));
          expect(actualArguments).to.deep.equal(testCase.expectedArguments);
        });
      }
    });
  });
});

class ExpressionBuilder {
  private position: ExpressionPosition = new ExpressionPosition(0, 5);

  private parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub();

  public withPosition(position: ExpressionPosition) {
    this.position = position;
    return this;
  }

  public withEvaluator(evaluator: ExpressionEvaluator) {
    this.evaluator = evaluator;
    return this;
  }

  public withParameters(parameters: IReadOnlyFunctionParameterCollection) {
    this.parameters = parameters;
    return this;
  }

  public withParameterName(parameterName: string, isOptional = true) {
    const collection = new FunctionParameterCollectionStub()
      .withParameterName(parameterName, isOptional);
    return this.withParameters(collection);
  }

  public withParameterNames(parameterNames: string[], isOptional = true) {
    const collection = new FunctionParameterCollectionStub()
      .withParameterNames(parameterNames, isOptional);
    return this.withParameters(collection);
  }

  public build() {
    return new Expression(this.position, this.evaluator, this.parameters);
  }

  private evaluator: ExpressionEvaluator = () => '';
}
