import { describe, it, expect } from 'vitest';
import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';
import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/ISanityCheckOptions';
import { SanityCheckOptionsStub } from '@tests/unit/shared/Stubs/SanityCheckOptionsStub';
import { ISanityValidator } from '@/infrastructure/RuntimeSanity/ISanityValidator';
import { SanityValidatorStub } from '@tests/unit/shared/Stubs/SanityValidatorStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('SanityChecks', () => {
  describe('validateRuntimeSanity', () => {
    describe('parameter validation', () => {
      describe('options', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing options';
          const context = new TestContext()
            .withOptions(absentValue);
          // act
          const act = () => context.validateRuntimeSanity();
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      it('throws when validators are empty', () => {
        // arrange
        const expectedError = 'missing validators';
        const context = new TestContext()
          .withValidators([]);
        // act
        const act = () => context.validateRuntimeSanity();
        // assert
        expect(act).to.throw(expectedError);
      });
    });

    describe('aggregates validators', () => {
      it('does not throw if all validators pass', () => {
        // arrange
        const context = new TestContext()
          .withValidators([
            new SanityValidatorStub()
              .withShouldValidateResult(false),
            new SanityValidatorStub()
              .withShouldValidateResult(false),
          ]);
        // act
        const act = () => context.validateRuntimeSanity();
        // assert
        expect(act).to.not.throw();
      });
      it('does not throw if a validator return errors but pass', () => {
        // arrange
        const context = new TestContext()
          .withValidators([
            new SanityValidatorStub()
              .withErrorsResult(['should be ignored'])
              .withShouldValidateResult(false),
          ]);
        // act
        const act = () => context.validateRuntimeSanity();
        // assert
        expect(act).to.not.throw();
      });
      it('does not throw if validators return no errors', () => {
        // arrange
        const context = new TestContext()
          .withValidators([
            new SanityValidatorStub()
              .withShouldValidateResult(true)
              .withErrorsResult([]),
            new SanityValidatorStub()
              .withShouldValidateResult(true)
              .withErrorsResult([]),
          ]);
        // act
        const act = () => context.validateRuntimeSanity();
        // assert
        expect(act).to.not.throw();
      });
      it('throws if single validator has errors', () => {
        // arrange
        const firstError = 'first-error';
        const secondError = 'second-error';
        let actualError = '';
        const context = new TestContext()
          .withValidators([
            new SanityValidatorStub()
              .withShouldValidateResult(true)
              .withErrorsResult([firstError, secondError]),
          ]);
        // act
        try {
          context.validateRuntimeSanity();
        } catch (err) {
          actualError = err.toString();
        }
        // assert
        expect(actualError).to.have.length.above(0);
        expect(actualError).to.include(firstError);
        expect(actualError).to.include(secondError);
      });
      it('accumulates error messages from validators', () => {
        // arrange
        const errorFromFirstValidator = 'first-error';
        const errorFromSecondValidator = 'second-error';
        let actualError = '';
        const context = new TestContext()
          .withValidators([
            new SanityValidatorStub()
              .withShouldValidateResult(true)
              .withErrorsResult([errorFromFirstValidator]),
            new SanityValidatorStub()
              .withShouldValidateResult(true)
              .withErrorsResult([errorFromSecondValidator]),
          ]);
        // act
        try {
          context.validateRuntimeSanity();
        } catch (err) {
          actualError = err.toString();
        }
        // assert
        expect(actualError).to.have.length.above(0);
        expect(actualError).to.include(errorFromFirstValidator);
        expect(actualError).to.include(errorFromSecondValidator);
      });
    });
  });
});

class TestContext {
  private options: ISanityCheckOptions = new SanityCheckOptionsStub();

  private validators: ISanityValidator[] = [new SanityValidatorStub()];

  public withOptionsSetup(
    setup: (stub: SanityCheckOptionsStub) => SanityCheckOptionsStub,
  ) {
    return this.withOptions(setup(new SanityCheckOptionsStub()));
  }

  public withOptions(options: ISanityCheckOptions): this {
    this.options = options;
    return this;
  }

  public withValidators(validators: ISanityValidator[]): this {
    this.validators = validators;
    return this;
  }

  public validateRuntimeSanity(): ReturnType<typeof validateRuntimeSanity> {
    return validateRuntimeSanity(this.options, this.validators);
  }
}
