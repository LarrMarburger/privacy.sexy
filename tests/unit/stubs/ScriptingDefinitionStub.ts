import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';

export class ScriptingDefinitionStub implements IScriptingDefinition {
  public fileExtension = '.bat';

  public language = ScriptingLanguage.batchfile;

  public startCode = 'REM start code';

  public endCode = 'REM end code';

  public withStartCode(startCode: string): ScriptingDefinitionStub {
    this.startCode = startCode;
    return this;
  }

  public withEndCode(endCode: string): ScriptingDefinitionStub {
    this.endCode = endCode;
    return this;
  }

  public withLanguage(language: ScriptingLanguage): ScriptingDefinitionStub {
    this.language = language;
    return this;
  }
}
