import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';

const BatchFileCommonCodeParts = ['(', ')', 'else', '||'];
const PowerShellCommonCodeParts = ['{', '}'];

export class BatchFileSyntax implements ILanguageSyntax {
  public readonly commentDelimiters = ['REM', '::'];

  public readonly commonCodeParts = [...BatchFileCommonCodeParts, ...PowerShellCommonCodeParts];
}
