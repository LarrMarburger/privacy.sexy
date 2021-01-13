import { Category } from '@/domain/Category';
import { CollectionData } from 'js-yaml-loader!@/*';
import { parseCategory } from './CategoryParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { parseScriptingDefinition } from './ScriptingDefinitionParser';
import { createEnumParser } from '../Common/Enum';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { CategoryCollection } from '@/domain/CategoryCollection';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { CategoryCollectionParseContext } from './Script/CategoryCollectionParseContext';

export function parseCategoryCollection(
    content: CollectionData,
    info: IProjectInformation,
    osParser = createEnumParser(OperatingSystem)): ICategoryCollection {
    validate(content);
    const scripting = parseScriptingDefinition(content.scripting, info);
    const context = new CategoryCollectionParseContext(content.functions, scripting);
    const categories = new Array<Category>();
    for (const action of content.actions) {
        const category = parseCategory(action, context);
        categories.push(category);
    }
    const os = osParser.parseEnum(content.os, 'os');
    const collection = new CategoryCollection(
        os,
        categories,
        scripting);
    return collection;
}

function validate(content: CollectionData): void {
    if (!content) {
        throw new Error('content is null or undefined');
    }
    if (!content.actions || content.actions.length <= 0) {
        throw new Error('content does not define any action');
    }
}
