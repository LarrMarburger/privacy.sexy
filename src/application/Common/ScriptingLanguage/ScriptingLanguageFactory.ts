import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { IScriptingLanguageFactory } from './IScriptingLanguageFactory';
import { assertInRange } from '@/application/Common/Enum';

type Getter<T> = () => T;

export abstract class ScriptingLanguageFactory<T> implements IScriptingLanguageFactory<T> {
    private readonly getters = new Map<ScriptingLanguage, Getter<T>>();

    public create(language: ScriptingLanguage): T {
        assertInRange(language, ScriptingLanguage);
        if (!this.getters.has(language)) {
            throw new RangeError(`unknown language: "${ScriptingLanguage[language]}"`);
        }
        const getter = this.getters.get(language);
        const instance = getter();
        return instance;
    }

    protected registerGetter(language: ScriptingLanguage, getter: Getter<T>) {
        assertInRange(language, ScriptingLanguage);
        if (!getter)  {
            throw new Error('undefined getter');
        }
        if (this.getters.has(language)) {
            throw new Error(`${ScriptingLanguage[language]} is already registered`);
        }
        this.getters.set(language, getter);
    }

}
