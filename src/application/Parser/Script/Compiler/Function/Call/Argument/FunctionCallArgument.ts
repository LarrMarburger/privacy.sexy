import { ensureValidParameterName } from '../../Shared/ParameterNameValidator';
import { IFunctionCallArgument } from './IFunctionCallArgument';

export class FunctionCallArgument implements IFunctionCallArgument {
  constructor(
    public readonly parameterName: string,
    public readonly argumentValue: string,
  ) {
    ensureValidParameterName(parameterName);
    if (!argumentValue) {
      throw new Error(`undefined argument value for "${parameterName}"`);
    }
  }
}
