import { CodeBuilder } from '@/application/Context/State/Code/Generation/CodeBuilder';

export class ShellBuilder extends CodeBuilder {
  protected getCommentDelimiter(): string {
    return '#';
  }

  protected writeStandardOut(text: string): string {
    return `echo '${escapeForEcho(text)}'`;
  }
}

function escapeForEcho(text: string) {
  return text
    .replace(/'/g, '\'\\\'\'');
}
