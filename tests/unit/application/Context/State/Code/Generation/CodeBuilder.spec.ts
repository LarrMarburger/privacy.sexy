import 'mocha';
import { expect } from 'chai';
import { CodeBuilder } from '@/application/Context/State/Code/Generation/CodeBuilder';

describe('CodeBuilder', () => {
  class CodeBuilderConcrete extends CodeBuilder {
    private commentDelimiter = '//';

    public withCommentDelimiter(delimiter: string): CodeBuilderConcrete {
      this.commentDelimiter = delimiter;
      return this;
    }

    protected getCommentDelimiter(): string {
      return this.commentDelimiter;
    }

    protected writeStandardOut(text: string): string {
      return text;
    }
  }
  describe('appendLine', () => {
    it('when empty appends empty line', () => {
      // arrange
      const sut = new CodeBuilderConcrete();
      // act
      sut.appendLine().appendLine().appendLine();
      // assert
      expect(sut.toString()).to.equal('\n\n');
    });
    it('when not empty append string in new line', () => {
      // arrange
      const sut = new CodeBuilderConcrete();
      const expected = 'str';
      // act
      sut.appendLine()
        .appendLine(expected);
      // assert
      const result = sut.toString();
      const lines = getLines(result);
      expect(lines[1]).to.equal('str');
    });
  });
  it('appendFunction', () => {
    // arrange
    const sut = new CodeBuilderConcrete();
    const functionName = 'function';
    const code = 'code';
    // act
    sut.appendFunction(functionName, code);
    // assert
    const result = sut.toString();
    expect(result).to.include(functionName);
    expect(result).to.include(code);
  });
  it('appendTrailingHyphensCommentLine', () => {
    // arrange
    const commentDelimiter = '//';
    const sut = new CodeBuilderConcrete()
      .withCommentDelimiter(commentDelimiter);
    const totalHyphens = 5;
    const expected = `${commentDelimiter} ${'-'.repeat(totalHyphens)}`;
    // act
    sut.appendTrailingHyphensCommentLine(totalHyphens);
    // assert
    const result = sut.toString();
    const lines = getLines(result);
    expect(lines[0]).to.equal(expected);
  });
  it('appendCommentLine', () => {
    // arrange
    const commentDelimiter = '//';
    const sut = new CodeBuilderConcrete()
      .withCommentDelimiter(commentDelimiter);
    const comment = 'comment';
    const expected = `${commentDelimiter} comment`;
    // act
    const result = sut
      .appendCommentLine(comment)
      .toString();
    // assert
    const lines = getLines(result);
    expect(lines[0]).to.equal(expected);
  });
  it('appendCommentLineWithHyphensAround', () => {
    // arrange
    const commentDelimiter = '//';
    const sut = new CodeBuilderConcrete()
      .withCommentDelimiter(commentDelimiter);
    const sectionName = 'section';
    const totalHyphens = sectionName.length + 3 * 2;
    const expected = `${commentDelimiter} ---section---`;
    // act
    const result = sut
      .appendCommentLineWithHyphensAround(sectionName, totalHyphens)
      .toString();
    // assert
    const lines = getLines(result);
    expect(lines[1]).to.equal(expected);
  });
  describe('currentLine', () => {
    it('no lines returns zero', () => {
      // arrange & act
      const sut = new CodeBuilderConcrete();
      // assert
      expect(sut.currentLine).to.equal(0);
    });
    it('single line returns one', () => {
      // arrange
      const sut = new CodeBuilderConcrete();
      // act
      sut.appendLine();
      // assert
      expect(sut.currentLine).to.equal(1);
    });
    it('multiple lines returns as expected', () => {
      // arrange
      const sut = new CodeBuilderConcrete();
      // act
      sut.appendLine('1')
        .appendCommentLine('2')
        .appendLine();
      // assert
      expect(sut.currentLine).to.equal(3);
    });
    it('multiple lines in code', () => {
      // arrange
      const sut = new CodeBuilderConcrete();
      // act
      sut.appendLine('hello\ncode-here\nwith-3-lines');
      // assert
      expect(sut.currentLine).to.equal(3);
    });
  });
});

function getLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}
