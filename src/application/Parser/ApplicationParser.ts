import type { CollectionData } from '@/application/collections/';
import { IApplication } from '@/domain/IApplication';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { Application } from '@/domain/Application';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { ViteAppMetadata } from '@/infrastructure/Metadata/Vite/ViteAppMetadata';
import { parseCategoryCollection } from './CategoryCollectionParser';

export function parseApplication(
  parser = parseCategoryCollection,
  metadata: IAppMetadata = new ViteAppMetadata(),
  collectionsData = PreParsedCollections,
): IApplication {
  validateCollectionsData(collectionsData);
  const information = parseProjectInformation(metadata);
  const collections = collectionsData.map((collection) => parser(collection, information));
  const app = new Application(information, collections);
  return app;
}

export type CategoryCollectionParserType
    = (file: CollectionData, info: IProjectInformation) => ICategoryCollection;

const PreParsedCollections: readonly CollectionData [] = [
  WindowsData, MacOsData, LinuxData,
];

function validateCollectionsData(collections: readonly CollectionData[]) {
  if (!collections?.length) {
    throw new Error('missing collections');
  }
  if (collections.some((collection) => !collection)) {
    throw new Error('missing collection provided');
  }
}
