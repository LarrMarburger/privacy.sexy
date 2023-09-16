import { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { SingleCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/SingleCallCompiler';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { SingleCallCompilerStub } from './SingleCallCompilerStub';
import { FunctionCallStub } from './FunctionCallStub';
import { SharedFunctionCollectionStub } from './SharedFunctionCollectionStub';

export class FunctionCallCompilationContextStub implements FunctionCallCompilationContext {
  public allFunctions: ISharedFunctionCollection = new SharedFunctionCollectionStub();

  public rootCallSequence: readonly FunctionCall[] = [
    new FunctionCallStub(), new FunctionCallStub(),
  ];

  public singleCallCompiler: SingleCallCompiler = new SingleCallCompilerStub();

  public withSingleCallCompiler(singleCallCompiler: SingleCallCompiler): this {
    this.singleCallCompiler = singleCallCompiler;
    return this;
  }

  public withAllFunctions(allFunctions: ISharedFunctionCollection): this {
    this.allFunctions = allFunctions;
    return this;
  }
}
