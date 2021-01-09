import { IScriptCompiler } from '@/application/Parser/Compiler/IScriptCompiler';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptData } from 'js-yaml-loader!@/*';

export class ScriptCompilerStub implements IScriptCompiler {
    public compilables = new Map<ScriptData, IScriptCode>();
    public canCompile(script: ScriptData): boolean {
        return this.compilables.has(script);
    }
    public compile(script: ScriptData): IScriptCode {
        return this.compilables.get(script);
    }
    public withCompileAbility(script: ScriptData, result?: IScriptCode): ScriptCompilerStub {
        this.compilables.set(script, result ||
            { execute: `compiled code of ${script.name}`, revert: `compiled revert code of ${script.name}` });
        return this;
    }
}
