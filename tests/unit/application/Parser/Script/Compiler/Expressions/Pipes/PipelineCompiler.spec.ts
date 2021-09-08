import 'mocha';
import { expect } from 'chai';
import { PipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipelineCompiler';
import { IPipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/IPipelineCompiler';
import { IPipeFactory } from '@/application/Parser/Script/Compiler/Expressions/Pipes/PipeFactory';
import { PipeStub } from '@tests/unit/stubs/PipeStub';
import { PipeFactoryStub } from '@tests/unit/stubs/PipeFactoryStub';

describe('PipelineCompiler', () => {
    describe('compile', () => {
        describe('throws for invalid arguments', () => {
            interface ITestCase {
                name: string;
                act: (test: PipelineTestRunner) => PipelineTestRunner;
                expectedError: string;
            }
            const testCases: ITestCase[] = [
                {
                    name: '"value" is empty',
                    act: (test) => test.withValue(''),
                    expectedError: 'undefined value',
                },
                {
                    name: '"value" is undefined',
                    act: (test) => test.withValue(undefined),
                    expectedError: 'undefined value',
                },
                {
                    name: '"pipeline" is empty',
                    act: (test) => test.withPipeline(''),
                    expectedError: 'undefined pipeline',
                },
                {
                    name: '"pipeline" is undefined',
                    act: (test) => test.withPipeline(undefined),
                    expectedError: 'undefined pipeline',
                },
                {
                    name: '"pipeline" does not start with pipe',
                    act: (test) => test.withPipeline('pipeline |'),
                    expectedError: 'pipeline does not start with pipe',
                },
            ];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    // act
                    const runner = new PipelineTestRunner();
                    testCase.act(runner);
                    const act = () => runner.compile();
                    // assert
                    expect(act).to.throw(testCase.expectedError);
                });
            }
        });
        describe('compiles pipeline as expected', () => {
            const testCases = [
                {
                    name: 'compiles single pipe as expected',
                    pipes: [
                        new PipeStub().withName('doublePrint').withApplier((value) => `${value}-${value}`),
                    ],
                    pipeline: '| doublePrint',
                    value: 'value',
                    expected: 'value-value',
                },
                {
                    name: 'compiles multiple pipes as expected',
                    pipes: [
                        new PipeStub().withName('prependLetterA').withApplier((value) => `A-${value}`),
                        new PipeStub().withName('prependLetterB').withApplier((value) => `B-${value}`),
                    ],
                    pipeline: '| prependLetterA | prependLetterB',
                    value: 'value',
                    expected: 'B-A-value',
                },
                {
                    name: 'compiles with relaxed whitespace placing',
                    pipes: [
                        new PipeStub().withName('appendNumberOne').withApplier((value) => `${value}1`),
                        new PipeStub().withName('appendNumberTwo').withApplier((value) => `${value}2`),
                        new PipeStub().withName('appendNumberThree').withApplier((value) => `${value}3`),
                    ],
                    pipeline: ' |      appendNumberOne|appendNumberTwo|   appendNumberThree',
                    value: 'value',
                    expected: 'value123',
                },
                {
                    name: 'can reuse same pipe',
                    pipes: [
                        new PipeStub().withName('removeFirstChar').withApplier((value) => `${value.slice(1)}`),
                    ],
                    pipeline: ' | removeFirstChar | removeFirstChar | removeFirstChar',
                    value: 'value',
                    expected: 'ue',
                },
            ];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    // arrange
                    const runner =
                        new PipelineTestRunner()
                            .withValue(testCase.value)
                            .withPipeline(testCase.pipeline)
                            .withFactory(new PipeFactoryStub().withPipes(testCase.pipes));
                    // act
                    const actual = runner.compile();
                    // expect
                    expect(actual).to.equal(testCase.expected);
                });
            }
        });
    });
});


class PipelineTestRunner implements IPipelineCompiler {
    private value: string = 'non-empty-value';
    private pipeline: string = '| validPipeline';
    private factory: IPipeFactory = new PipeFactoryStub();

    public withValue(value: string) {
        this.value = value;
        return this;
    }
    public withPipeline(pipeline: string) {
        this.pipeline = pipeline;
        return this;
    }
    public withFactory(factory: IPipeFactory) {
        this.factory = factory;
        return this;
    }

    public compile(): string {
        const sut = new PipelineCompiler(this.factory);
        return sut.compile(this.value, this.pipeline);
    }
}
