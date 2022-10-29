import 'mocha';
import { expect } from 'chai';
import type { FunctionData } from '@/application/collections/';
import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { SharedFunctionsParser } from '@/application/Parser/Script/Compiler/Function/SharedFunctionsParser';
import { FunctionDataStub } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { ParameterDefinitionDataStub } from '@tests/unit/shared/Stubs/ParameterDefinitionDataStub';
import { FunctionParameter } from '@/application/Parser/Script/Compiler/Function/Parameter/FunctionParameter';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import { itEachAbsentCollectionValue, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import { NoDuplicatedLines } from '@/application/Parser/Script/Validation/Rules/NoDuplicatedLines';

describe('SharedFunctionsParser', () => {
  describe('instance', () => {
    itIsSingleton({
      getter: () => SharedFunctionsParser.instance,
      expectedType: SharedFunctionsParser,
    });
  });
  describe('parseFunctions', () => {
    describe('throws if syntax is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing syntax';
        const syntax = absentValue;
        // act
        const act = () => new ParseFunctionsCallerWithDefaults()
          .withSyntax(syntax)
          .parseFunctions();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('validates functions', () => {
      describe('throws if one of the functions is undefined', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'some functions are undefined';
          const functions = [FunctionDataStub.createWithCode(), absentValue];
          const sut = new ParseFunctionsCallerWithDefaults();
          // act
          const act = () => sut
            .withFunctions(functions)
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      it('throws when functions have same names', () => {
        // arrange
        const name = 'same-func-name';
        const expectedError = `duplicate function name: "${name}"`;
        const functions = [
          FunctionDataStub.createWithCode().withName(name),
          FunctionDataStub.createWithCode().withName(name),
        ];
        // act
        const act = () => new ParseFunctionsCallerWithDefaults()
          .withFunctions(functions)
          .parseFunctions();
        // assert
        expect(act).to.throw(expectedError);
      });
      describe('throws when when function have duplicate code', () => {
        it('code', () => {
          // arrange
          const code = 'duplicate-code';
          const expectedError = `duplicate "code" in functions: "${code}"`;
          const functions = [
            FunctionDataStub.createWithoutCallOrCodes().withName('func-1').withCode(code),
            FunctionDataStub.createWithoutCallOrCodes().withName('func-2').withCode(code),
          ];
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions(functions)
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
        it('revertCode', () => {
          // arrange
          const revertCode = 'duplicate-revert-code';
          const expectedError = `duplicate "revertCode" in functions: "${revertCode}"`;
          const functions = [
            FunctionDataStub.createWithoutCallOrCodes()
              .withName('func-1').withCode('code-1').withRevertCode(revertCode),
            FunctionDataStub.createWithoutCallOrCodes()
              .withName('func-2').withCode('code-2').withRevertCode(revertCode),
          ];
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions(functions)
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('ensures either call or code is defined', () => {
        it('both code and call are defined', () => {
          // arrange
          const functionName = 'invalid-function';
          const expectedError = `both "code" and "call" are defined in "${functionName}"`;
          const invalidFunction = FunctionDataStub.createWithoutCallOrCodes()
            .withName(functionName)
            .withCode('code')
            .withMockCall();
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions([invalidFunction])
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
        it('neither code and call is defined', () => {
          // arrange
          const functionName = 'invalid-function';
          const expectedError = `neither "code" or "call" is defined in "${functionName}"`;
          const invalidFunction = FunctionDataStub.createWithoutCallOrCodes()
            .withName(functionName);
          // act
          const act = () => new ParseFunctionsCallerWithDefaults()
            .withFunctions([invalidFunction])
            .parseFunctions();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('throws when parameters type is not as expected', () => {
        const testCases = [
          {
            state: 'when not an array',
            invalidType: 5,
          },
          {
            state: 'when array but not of objects',
            invalidType: ['a', { a: 'b' }],
          },
        ];
        for (const testCase of testCases) {
          it(testCase.state, () => {
            // arrange
            const func = FunctionDataStub
              .createWithCall()
              .withParametersObject(testCase.invalidType as never);
            const expectedError = `parameters must be an array of objects in function(s) "${func.name}"`;
            // act
            const act = () => new ParseFunctionsCallerWithDefaults()
              .withFunctions([func])
              .parseFunctions();
            // assert
            expect(act).to.throw(expectedError);
          });
        }
      });
      it('validates function code as expected when code is defined', () => {
        // arrange
        const expectedRules = [NoEmptyLines, NoDuplicatedLines];
        const functionData = FunctionDataStub
          .createWithCode()
          .withCode('expected code to be validated')
          .withRevertCode('expected revert code to be validated');
        const validator = new CodeValidatorStub();
        // act
        new ParseFunctionsCallerWithDefaults()
          .withFunctions([functionData])
          .withValidator(validator)
          .parseFunctions();
        // assert
        validator.assertHistory({
          validatedCodes: [functionData.code, functionData.revertCode],
          rules: expectedRules,
        });
      });
      it('rethrows including function name when FunctionParameter throws', () => {
        // arrange
        const invalidParameterName = 'invalid function p@r4meter name';
        const functionName = 'functionName';
        let parameterException: Error;
        try {
        // eslint-disable-next-line no-new
          new FunctionParameter(invalidParameterName, false);
        } catch (e) { parameterException = e; }
        const expectedError = `"${functionName}": ${parameterException.message}`;
        const functionData = FunctionDataStub.createWithCode()
          .withName(functionName)
          .withParameters(new ParameterDefinitionDataStub().withName(invalidParameterName));

        // act
        const act = () => new ParseFunctionsCallerWithDefaults()
          .withFunctions([functionData])
          .parseFunctions();

        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('given empty functions, returns empty collection', () => {
      itEachAbsentCollectionValue((absentValue) => {
        // act
        const actual = new ParseFunctionsCallerWithDefaults()
          .withFunctions(absentValue)
          .parseFunctions();
        // assert
        expect(actual).to.not.equal(undefined);
      });
    });
    describe('function with inline code', () => {
      it('parses single function with code as expected', () => {
        // arrange
        const name = 'function-name';
        const expected = FunctionDataStub
          .createWithoutCallOrCodes()
          .withName(name)
          .withCode('expected-code')
          .withRevertCode('expected-revert-code')
          .withParameters(
            new ParameterDefinitionDataStub().withName('expectedParameter').withOptionality(true),
            new ParameterDefinitionDataStub().withName('expectedParameter2').withOptionality(false),
          );
        // act
        const collection = new ParseFunctionsCallerWithDefaults()
          .withFunctions([expected])
          .parseFunctions();
        // expect
        const actual = collection.getFunctionByName(name);
        expectEqualName(expected, actual);
        expectEqualParameters(expected, actual);
        expectEqualFunctionWithInlineCode(expected, actual);
      });
    });
    describe('function with calls', () => {
      it('parses single function with call as expected', () => {
        // arrange
        const call = new FunctionCallDataStub()
          .withName('calleeFunction')
          .withParameters({ test: 'value' });
        const data = FunctionDataStub.createWithoutCallOrCodes()
          .withName('caller-function')
          .withCall(call);
        // act
        const collection = new ParseFunctionsCallerWithDefaults()
          .withFunctions([data])
          .parseFunctions();
        // expect
        const actual = collection.getFunctionByName(data.name);
        expectEqualName(data, actual);
        expectEqualParameters(data, actual);
        expectEqualCalls([call], actual);
      });
      it('parses multiple functions with call as expected', () => {
        // arrange
        const call1 = new FunctionCallDataStub()
          .withName('calleeFunction1')
          .withParameters({ param: 'value' });
        const call2 = new FunctionCallDataStub()
          .withName('calleeFunction2')
          .withParameters({ param2: 'value2' });
        const caller1 = FunctionDataStub.createWithoutCallOrCodes()
          .withName('caller-function')
          .withCall(call1);
        const caller2 = FunctionDataStub.createWithoutCallOrCodes()
          .withName('caller-function-2')
          .withCall([call1, call2]);
        // act
        const collection = new ParseFunctionsCallerWithDefaults()
          .withFunctions([caller1, caller2])
          .parseFunctions();
        // expect
        const compiledCaller1 = collection.getFunctionByName(caller1.name);
        expectEqualName(caller1, compiledCaller1);
        expectEqualParameters(caller1, compiledCaller1);
        expectEqualCalls([call1], compiledCaller1);
        const compiledCaller2 = collection.getFunctionByName(caller2.name);
        expectEqualName(caller2, compiledCaller2);
        expectEqualParameters(caller2, compiledCaller2);
        expectEqualCalls([call1, call2], compiledCaller2);
      });
    });
  });
});

class ParseFunctionsCallerWithDefaults {
  private syntax: ILanguageSyntax = new LanguageSyntaxStub();

  private codeValidator: ICodeValidator = new CodeValidatorStub();

  private functions: readonly FunctionData[] = [FunctionDataStub.createWithCode()];

  public withSyntax(syntax: ILanguageSyntax) {
    this.syntax = syntax;
    return this;
  }

  public withValidator(codeValidator: ICodeValidator) {
    this.codeValidator = codeValidator;
    return this;
  }

  public withFunctions(functions: readonly FunctionData[]) {
    this.functions = functions;
    return this;
  }

  public parseFunctions() {
    const sut = new SharedFunctionsParser(this.codeValidator);
    return sut.parseFunctions(this.functions, this.syntax);
  }
}

function expectEqualName(expected: FunctionDataStub, actual: ISharedFunction): void {
  expect(actual.name).to.equal(expected.name);
}

function expectEqualParameters(expected: FunctionDataStub, actual: ISharedFunction): void {
  const actualSimplifiedParameters = actual.parameters.all.map((parameter) => ({
    name: parameter.name,
    optional: parameter.isOptional,
  }));
  const expectedSimplifiedParameters = expected.parameters?.map((parameter) => ({
    name: parameter.name,
    optional: parameter.optional || false,
  })) || [];
  expect(expectedSimplifiedParameters).to.deep.equal(actualSimplifiedParameters, 'Unequal parameters');
}

function expectEqualFunctionWithInlineCode(
  expected: FunctionData,
  actual: ISharedFunction,
): void {
  expect(actual.body, `function "${actual.name}" has no body`);
  expect(actual.body.code, `function "${actual.name}" has no code`);
  expect(actual.body.code.execute).to.equal(expected.code);
  expect(actual.body.code.revert).to.equal(expected.revertCode);
}

function expectEqualCalls(
  expected: FunctionCallDataStub[],
  actual: ISharedFunction,
) {
  expect(actual.body, `function "${actual.name}" has no body`);
  expect(actual.body.calls, `function "${actual.name}" has no calls`);
  const actualSimplifiedCalls = actual.body.calls
    .map((call) => ({
      function: call.functionName,
      params: call.args.getAllParameterNames().map((name) => ({
        name, value: call.args.getArgument(name).argumentValue,
      })),
    }));
  const expectedSimplifiedCalls = expected
    .map((call) => ({
      function: call.function,
      params: Object.keys(call.parameters).map((key) => (
        { name: key, value: call.parameters[key] }
      )),
    }));
  expect(actualSimplifiedCalls).to.deep.equal(expectedSimplifiedCalls, 'Unequal calls');
}
