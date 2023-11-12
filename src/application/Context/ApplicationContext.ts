import { IApplication } from '@/domain/IApplication';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { assertInRange } from '@/application/Common/Enum';
import { CategoryCollectionState } from './State/CategoryCollectionState';
import { ICategoryCollectionState } from './State/ICategoryCollectionState';
import { IApplicationContext, IApplicationContextChangedEvent } from './IApplicationContext';

type StateMachine = Map<OperatingSystem, ICategoryCollectionState>;

export class ApplicationContext implements IApplicationContext {
  public readonly contextChanged = new EventSource<IApplicationContextChangedEvent>();

  public collection: ICategoryCollection;

  public currentOs: OperatingSystem;

  public get state(): ICategoryCollectionState {
    return this.states[this.collection.os];
  }

  private readonly states: StateMachine;

  public constructor(
    public readonly app: IApplication,
    initialContext: OperatingSystem,
  ) {
    this.states = initializeStates(app);
    this.changeContext(initialContext);
  }

  public changeContext(os: OperatingSystem): void {
    assertInRange(os, OperatingSystem);
    if (this.currentOs === os) {
      return;
    }
    const collection = this.app.getCollection(os);
    this.collection = collection;
    const event: IApplicationContextChangedEvent = {
      newState: this.states[os],
      oldState: this.states[this.currentOs],
    };
    this.contextChanged.notify(event);
    this.currentOs = os;
  }
}

function initializeStates(app: IApplication): StateMachine {
  const machine = new Map<OperatingSystem, ICategoryCollectionState>();
  for (const collection of app.collections) {
    machine[collection.os] = new CategoryCollectionState(collection);
  }
  return machine;
}
