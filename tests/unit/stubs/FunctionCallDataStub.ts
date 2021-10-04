import { FunctionCallData, FunctionCallParametersData } from 'js-yaml-loader!@/*';

export class FunctionCallDataStub implements FunctionCallData {
    public function = 'callDatStubCalleeFunction';
    public parameters: { [index: string]: string } = { testParameter : 'testArgument' };

    public withName(functionName: string) {
        this.function = functionName;
        return this;
    }
    public withParameters(parameters: FunctionCallParametersData) {
        this.parameters = parameters;
        return this;
    }
}
