import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';
import { IFunctionCall } from './Call/IFunctionCall';

export interface ISharedFunction {
  readonly name: string;
  readonly parameters: IReadOnlyFunctionParameterCollection;
  readonly body: ISharedFunctionBody;
}

export interface ISharedFunctionBody {
  readonly type: FunctionBodyType;
  readonly code: IFunctionCode;
  readonly calls: readonly IFunctionCall[];
}

export enum FunctionBodyType {
  Code,
  Calls,
}

export interface IFunctionCode {
  readonly execute: string;
  readonly revert?: string;
}
