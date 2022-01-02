import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IReadOnlyUserFilter, IUserFilter } from './Filter/IUserFilter';
import { IReadOnlyUserSelection, IUserSelection } from './Selection/IUserSelection';
import { IApplicationCode } from './Code/IApplicationCode';

export interface IReadOnlyCategoryCollectionState {
  readonly code: IApplicationCode;
  readonly os: OperatingSystem;
  readonly filter: IReadOnlyUserFilter;
  readonly selection: IReadOnlyUserSelection;
  readonly collection: ICategoryCollection;
}

export interface ICategoryCollectionState extends IReadOnlyCategoryCollectionState {
  readonly filter: IUserFilter;
  readonly selection: IUserSelection;
}
