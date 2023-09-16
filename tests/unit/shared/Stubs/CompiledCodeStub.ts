import { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';

export class CompiledCodeStub implements CompiledCode {
  public code = `${CompiledCodeStub.name}: code`;

  public revertCode?: string = `${CompiledCodeStub.name}: revertCode`;

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withRevertCode(revertCode?: string): this {
    this.revertCode = revertCode;
    return this;
  }
}
