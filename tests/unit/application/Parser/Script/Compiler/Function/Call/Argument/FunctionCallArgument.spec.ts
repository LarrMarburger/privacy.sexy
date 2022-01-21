import 'mocha';
import { expect } from 'chai';
import { FunctionCallArgument } from '@/application/Parser/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { testParameterName } from '../../../ParameterNameTestRunner';

describe('FunctionCallArgument', () => {
  describe('ctor', () => {
    describe('parameter name', () => {
      testParameterName(
        (parameterName) => new FunctionCallArgumentBuilder()
          .withParameterName(parameterName)
          .build()
          .parameterName,
      );
    });
    describe('throws if argument value is absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const parameterName = 'paramName';
        const expectedError = `missing argument value for "${parameterName}"`;
        const argumentValue = absentValue;
        // act
        const act = () => new FunctionCallArgumentBuilder()
          .withParameterName(parameterName)
          .withArgumentValue(argumentValue)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

class FunctionCallArgumentBuilder {
  private parameterName = 'default-parameter-name';

  private argumentValue = 'default-argument-value';

  public withParameterName(parameterName: string) {
    this.parameterName = parameterName;
    return this;
  }

  public withArgumentValue(argumentValue: string) {
    this.argumentValue = argumentValue;
    return this;
  }

  public build() {
    return new FunctionCallArgument(this.parameterName, this.argumentValue);
  }
}
