import { ISharedFunction, ISharedFunctionBody, FunctionBodyType } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { FunctionParameterCollectionStub } from './FunctionParameterCollectionStub';
import { FunctionCallStub } from './FunctionCallStub';

export class SharedFunctionStub implements ISharedFunction {
  public name = 'shared-function-stub-name';

  public parameters: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub()
    .withParameterName('shared-function-stub-parameter-name');

  private code = 'shared-function-stub-code';

  private revertCode = 'shared-function-stub-revert-code';

  private bodyType: FunctionBodyType = FunctionBodyType.Code;

  private calls: FunctionCall[] = [new FunctionCallStub()];

  constructor(type: FunctionBodyType) {
    this.bodyType = type;
  }

  public get body(): ISharedFunctionBody {
    return {
      type: this.bodyType,
      code: this.bodyType === FunctionBodyType.Code ? {
        execute: this.code,
        revert: this.revertCode,
      } : undefined,
      calls: this.bodyType === FunctionBodyType.Calls ? this.calls : undefined,
    };
  }

  public withName(name: string) {
    this.name = name;
    return this;
  }

  public withCode(code: string) {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode: string) {
    this.revertCode = revertCode;
    return this;
  }

  public withParameters(parameters: IReadOnlyFunctionParameterCollection) {
    this.parameters = parameters;
    return this;
  }

  public withSomeCalls() {
    return this.withCalls(new FunctionCallStub(), new FunctionCallStub());
  }

  public withCalls(...calls: readonly FunctionCall[]) {
    this.calls = [...calls];
    return this;
  }

  public withParameterNames(...parameterNames: readonly string[]) {
    let collection = new FunctionParameterCollectionStub();
    for (const name of parameterNames) {
      collection = collection.withParameterName(name);
    }
    return this.withParameters(collection);
  }
}
