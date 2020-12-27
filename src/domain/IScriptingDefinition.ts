import { ScriptingLanguage } from './ScriptingLanguage';

export interface IScriptingDefinition {
    readonly fileExtension: string;
    readonly language: ScriptingLanguage;
    readonly startCode: string;
    readonly endCode: string;
}
