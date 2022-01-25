import 'mocha';
import { expect } from 'chai';
import { parseScript } from '@/application/Parser/Script/ScriptParser';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ICategoryCollectionParseContext } from '@/application/Parser/Script/ICategoryCollectionParseContext';
import { ScriptCompilerStub } from '@tests/unit/shared/Stubs/ScriptCompilerStub';
import { ScriptDataStub } from '@tests/unit/shared/Stubs/ScriptDataStub';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import { CategoryCollectionParseContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionParseContextStub';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { itEachAbsentObjectValue, itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('ScriptParser', () => {
  describe('parseScript', () => {
    it('parses name as expected', () => {
      // arrange
      const expected = 'test-expected-name';
      const script = ScriptDataStub.createWithCode()
        .withName(expected);
      const parseContext = new CategoryCollectionParseContextStub();
      // act
      const actual = parseScript(script, parseContext);
      // assert
      expect(actual.name).to.equal(expected);
    });
    it('parses docs as expected', () => {
      // arrange
      const docs = ['https://expected-doc1.com', 'https://expected-doc2.com'];
      const script = ScriptDataStub.createWithCode()
        .withDocs(docs);
      const parseContext = new CategoryCollectionParseContextStub();
      const expected = parseDocUrls(script);
      // act
      const actual = parseScript(script, parseContext);
      // assert
      expect(actual.documentationUrls).to.deep.equal(expected);
    });
    describe('invalid script', () => {
      describe('throws when script is absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing script';
          const parseContext = new CategoryCollectionParseContextStub();
          const script = absentValue;
          // act
          const act = () => parseScript(script, parseContext);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      it('throws when both function call and code are defined', () => {
        // arrange
        const expectedError = 'cannot define both "call" and "code"';
        const parseContext = new CategoryCollectionParseContextStub();
        const script = ScriptDataStub
          .createWithCall()
          .withCode('code');
        // act
        const act = () => parseScript(script, parseContext);
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws when both function call and revertCode are defined', () => {
        // arrange
        const expectedError = 'cannot define "revertCode" if "call" is defined';
        const parseContext = new CategoryCollectionParseContextStub();
        const script = ScriptDataStub
          .createWithCall()
          .withRevertCode('revert-code');
        // act
        const act = () => parseScript(script, parseContext);
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws when neither call or revertCode are defined', () => {
        // arrange
        const expectedError = 'must define either "call" or "code"';
        const parseContext = new CategoryCollectionParseContextStub();
        const script = ScriptDataStub.createWithoutCallOrCodes();
        // act
        const act = () => parseScript(script, parseContext);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('level', () => {
      describe('accepts absent level', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const parseContext = new CategoryCollectionParseContextStub();
          const script = ScriptDataStub.createWithCode()
            .withRecommend(absentValue);
          // act
          const actual = parseScript(script, parseContext);
          // assert
          expect(actual.level).to.equal(undefined);
        });
      });
      describe('parses level as expected', () => {
        // arrange
        const expectedLevel = RecommendationLevel.Standard;
        const expectedName = 'level';
        const levelText = 'standard';
        const script = ScriptDataStub.createWithCode()
          .withRecommend(levelText);
        const parseContext = new CategoryCollectionParseContextStub();
        const parserMock = new EnumParserStub<RecommendationLevel>()
          .setup(expectedName, levelText, expectedLevel);
        // act
        const actual = parseScript(script, parseContext, parserMock);
        // assert
        expect(actual.level).to.equal(expectedLevel);
      });
    });
    describe('code', () => {
      it('parses "execute" as expected', () => {
        // arrange
        const expected = 'expected-code';
        const script = ScriptDataStub
          .createWithCode()
          .withCode(expected);
        const parseContext = new CategoryCollectionParseContextStub();
        // act
        const parsed = parseScript(script, parseContext);
        // assert
        const actual = parsed.code.execute;
        expect(actual).to.equal(expected);
      });
      it('parses "revert" as expected', () => {
        // arrange
        const expected = 'expected-revert-code';
        const script = ScriptDataStub
          .createWithCode()
          .withRevertCode(expected);
        const parseContext = new CategoryCollectionParseContextStub();
        // act
        const parsed = parseScript(script, parseContext);
        // assert
        const actual = parsed.code.revert;
        expect(actual).to.equal(expected);
      });
      describe('compiler', () => {
        describe('throws when context is not defined', () => {
          itEachAbsentObjectValue((absentValue) => {
            // arrange
            const expectedMessage = 'missing context';
            const script = ScriptDataStub.createWithCode();
            const context: ICategoryCollectionParseContext = absentValue;
            // act
            const act = () => parseScript(script, context);
            // assert
            expect(act).to.throw(expectedMessage);
          });
        });
        it('gets code from compiler', () => {
          // arrange
          const expected = new ScriptCodeStub();
          const script = ScriptDataStub.createWithCode();
          const compiler = new ScriptCompilerStub()
            .withCompileAbility(script, expected);
          const parseContext = new CategoryCollectionParseContextStub()
            .withCompiler(compiler);
          // act
          const parsed = parseScript(script, parseContext);
          // assert
          const actual = parsed.code;
          expect(actual).to.equal(expected);
        });
      });
      describe('syntax', () => {
        it('set from the context', () => { // test through script validation logic
          // arrange
          const commentDelimiter = 'should not throw';
          const duplicatedCode = `${commentDelimiter} duplicate-line\n${commentDelimiter} duplicate-line`;
          const parseContext = new CategoryCollectionParseContextStub()
            .withSyntax(new LanguageSyntaxStub().withCommentDelimiters(commentDelimiter));
          const script = ScriptDataStub
            .createWithoutCallOrCodes()
            .withCode(duplicatedCode);
          // act
          const act = () => parseScript(script, parseContext);
          // assert
          expect(act).to.not.throw();
        });
      });
    });
  });
});
