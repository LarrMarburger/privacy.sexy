import { describe, it, expect } from 'vitest';
import { VueWrapper, shallowMount } from '@vue/test-utils';
import { Component } from 'vue';
import TheScriptsView from '@/presentation/components/Scripts/View/TheScriptsView.vue';
import ScriptsTree from '@/presentation/components/Scripts/View/Tree/ScriptsTree.vue';
import CardList from '@/presentation/components/Scripts/View/Cards/CardList.vue';
import { ViewType } from '@/presentation/components/Scripts/Menu/View/ViewType';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseApplicationStub } from '@tests/unit/shared/Stubs/UseApplicationStub';
import { UserFilterMethod, UserFilterStub } from '@tests/unit/shared/Stubs/UserFilterStub';
import { FilterResultStub } from '@tests/unit/shared/Stubs/FilterResultStub';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IFilterChangeDetails } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';
import { FilterChangeDetailsStub } from '@tests/unit/shared/Stubs/FilterChangeDetailsStub';

const DOM_SELECTOR_NO_MATCHES = '.search-no-matches';
const DOM_SELECTOR_CLOSE_BUTTON = '.search__query__close-button';

describe('TheScriptsView.vue', () => {
  describe('view types', () => {
    describe('initially', () => {
      interface IInitialViewTypeTestCase {
        readonly initialView: ViewType;
        readonly expectedComponent: Component;
        readonly absentComponents: readonly Component[];
      }
      const testCases: readonly IInitialViewTypeTestCase[] = [
        {
          initialView: ViewType.Tree,
          expectedComponent: ScriptsTree,
          absentComponents: [CardList],
        },
        {
          initialView: ViewType.Cards,
          expectedComponent: CardList,
          absentComponents: [ScriptsTree],
        },
      ];

      testCases.forEach(({ initialView, expectedComponent, absentComponents }) => {
        it(`given initial view, renders only ${ViewType[initialView]}`, () => {
          // act
          const wrapper = mountComponent({
            viewType: initialView,
          });

          // assert
          expect(wrapper.findComponent(expectedComponent).exists()).to.equal(true);
          expectComponentsToNotExist(wrapper, absentComponents);
        });
      });
    });
    describe('toggle view type', () => {
      interface IToggleViewTypeTestCase {
        readonly originalView: ViewType;
        readonly newView: ViewType;
        readonly absentComponents: readonly Component[];
        readonly expectedComponent: Component;
      }

      const toggleTestCases: IToggleViewTypeTestCase[] = [
        {
          originalView: ViewType.Tree,
          newView: ViewType.Cards,
          absentComponents: [ScriptsTree],
          expectedComponent: CardList,
        },
        {
          originalView: ViewType.Cards,
          newView: ViewType.Tree,
          absentComponents: [CardList],
          expectedComponent: ScriptsTree,
        },
      ];

      toggleTestCases.forEach(({
        originalView, newView, absentComponents, expectedComponent,
      }) => {
        it(`toggles from ${ViewType[originalView]} to ${ViewType[newView]}`, async () => {
          // arrange
          // act
          const wrapper = mountComponent({
            viewType: originalView,
          });
          await wrapper.setProps({ currentView: newView });

          // assert
          expect(wrapper.findComponent(expectedComponent).exists()).to.equal(true);
          expectComponentsToNotExist(wrapper, absentComponents);
        });
      });
    });
  });

  describe('switching views', () => {
    interface ISwitchingViewTestCase {
      readonly name: string;
      readonly initialView: ViewType;
      readonly changeEvents: readonly IFilterChangeDetails[];
      readonly componentsToDisappear: readonly Component[];
      readonly expectedComponent: Component;
      readonly setupFilter?: (filter: UserFilterStub) => UserFilterStub;
    }
    const testCases: readonly ISwitchingViewTestCase[] = [
      {
        name: 'tree on initial search with card view',
        initialView: ViewType.Cards,
        setupFilter: (filter: UserFilterStub) => filter
          .withCurrentFilterResult(
            new FilterResultStub().withQueryAndSomeMatches(),
          ),
        changeEvents: [],
        expectedComponent: ScriptsTree,
        componentsToDisappear: [CardList],
      },
      {
        name: 'restore card after initial search',
        initialView: ViewType.Cards,
        setupFilter: (filter: UserFilterStub) => filter
          .withCurrentFilterResult(
            new FilterResultStub().withQueryAndSomeMatches(),
          ),
        changeEvents: [
          FilterChangeDetailsStub.forClear(),
        ],
        expectedComponent: CardList,
        componentsToDisappear: [ScriptsTree],
      },
      {
        name: 'tree on search',
        initialView: ViewType.Cards,
        changeEvents: [
          FilterChangeDetailsStub.forApply(
            new FilterResultStub().withQueryAndSomeMatches(),
          ),
        ],
        expectedComponent: ScriptsTree,
        componentsToDisappear: [CardList],
      },
      {
        name: 'return to card after search',
        initialView: ViewType.Cards,
        changeEvents: [
          FilterChangeDetailsStub.forApply(
            new FilterResultStub().withQueryAndSomeMatches(),
          ),
          FilterChangeDetailsStub.forClear(),
        ],
        expectedComponent: CardList,
        componentsToDisappear: [ScriptsTree],
      },
      {
        name: 'return to tree after search',
        initialView: ViewType.Tree,
        changeEvents: [
          FilterChangeDetailsStub.forApply(
            new FilterResultStub().withQueryAndSomeMatches(),
          ),
          FilterChangeDetailsStub.forClear(),
        ],
        expectedComponent: ScriptsTree,
        componentsToDisappear: [CardList],
      },
    ];
    testCases.forEach(({
      name, initialView, changeEvents, expectedComponent: componentToAppear,
      componentsToDisappear, setupFilter,
    }) => {
      it(name, async () => {
        // arrange
        let filterStub = new UserFilterStub();
        if (setupFilter) {
          filterStub = setupFilter(filterStub);
        }
        const stateStub = new UseCollectionStateStub()
          .withFilter(filterStub);
        const wrapper = mountComponent({
          useCollectionState: stateStub.get(),
          viewType: initialView,
        });

        // act
        for (const changeEvent of changeEvents) {
          filterStub.notifyFilterChange(changeEvent);
          // eslint-disable-next-line no-await-in-loop
          await wrapper.vm.$nextTick();
        }

        // assert
        expect(wrapper.findComponent(componentToAppear).exists()).to.equal(true);
        expectComponentsToNotExist(wrapper, componentsToDisappear);
      });
    });
  });

  describe('close button', () => {
    describe('visibility', () => {
      describe('does not show close button when not searching', () => {
        it('not searching initially', () => {
          // arrange
          const filterStub = new UserFilterStub()
            .withNoCurrentFilter();
          const stateStub = new UseCollectionStateStub()
            .withFilter(filterStub);

          // act
          const wrapper = mountComponent({
            useCollectionState: stateStub.get(),
          });

          // assert
          const closeButton = wrapper.find(DOM_SELECTOR_CLOSE_BUTTON);
          expect(closeButton.exists()).to.equal(false);
        });
        it('stop searching', async () => {
          // arrange
          const filterStub = new UserFilterStub();
          const stateStub = new UseCollectionStateStub().withFilter(filterStub);
          const wrapper = mountComponent({
            useCollectionState: stateStub.get(),
          });

          // act
          filterStub.notifyFilterChange(FilterChangeDetailsStub.forApply(
            new FilterResultStub().withQueryAndSomeMatches(),
          ));
          await wrapper.vm.$nextTick();
          filterStub.notifyFilterChange(FilterChangeDetailsStub.forClear());
          await wrapper.vm.$nextTick();

          // assert
          const closeButton = wrapper.find(DOM_SELECTOR_CLOSE_BUTTON);
          expect(closeButton.exists()).to.equal(false);
        });
      });
      describe('shows close button when searching', () => {
        it('searching initially', () => {
          // arrange
          const filterStub = new UserFilterStub()
            .withCurrentFilterResult(
              new FilterResultStub().withQueryAndSomeMatches(),
            );
          const stateStub = new UseCollectionStateStub()
            .withFilter(filterStub);

          // act
          const wrapper = mountComponent({
            useCollectionState: stateStub.get(),
          });

          // assert
          const closeButton = wrapper.find(DOM_SELECTOR_CLOSE_BUTTON);
          expect(closeButton.exists()).to.equal(true);
        });
        it('start searching', async () => {
          // arrange
          const filterStub = new UserFilterStub()
            .withNoCurrentFilter();
          const stateStub = new UseCollectionStateStub().withFilter(filterStub);
          const wrapper = mountComponent({
            useCollectionState: stateStub.get(),
          });

          // act
          filterStub.notifyFilterChange(FilterChangeDetailsStub.forApply(
            new FilterResultStub().withQueryAndSomeMatches(),
          ));
          await wrapper.vm.$nextTick();

          // assert
          const closeButton = wrapper.find(DOM_SELECTOR_CLOSE_BUTTON);
          expect(closeButton.exists()).to.equal(true);
        });
      });
    });

    it('clears search query on close button click', async () => {
      // arrange
      const filterStub = new UserFilterStub();
      const stateStub = new UseCollectionStateStub().withFilter(filterStub);
      const wrapper = mountComponent({
        useCollectionState: stateStub.get(),
      });
      filterStub.notifyFilterChange(FilterChangeDetailsStub.forApply(
        new FilterResultStub().withQueryAndSomeMatches(),
      ));
      await wrapper.vm.$nextTick();
      filterStub.callHistory.length = 0;

      // act
      const closeButton = wrapper.find(DOM_SELECTOR_CLOSE_BUTTON);
      await closeButton.trigger('click');

      // assert
      expect(filterStub.callHistory).to.have.lengthOf(1);
      expect(filterStub.callHistory).to.include(UserFilterMethod.ClearFilter);
    });
  });

  describe('no matches text', () => {
    interface NoMatchesTextTestCase {
      readonly name: string;
      readonly filter: IFilterResult;
      readonly shouldNoMatchesExist: boolean;
    }
    const commonTestCases: readonly NoMatchesTextTestCase[] = [
      {
        name: 'shows text given no matches',
        filter: new FilterResultStub()
          .withQuery('non-empty query')
          .withEmptyMatches(),
        shouldNoMatchesExist: true,
      },
      {
        name: 'does not show text given some matches',
        filter: new FilterResultStub().withQueryAndSomeMatches(),
        shouldNoMatchesExist: false,
      },
    ];
    describe('initial state', () => {
      interface InitialStateTestCase extends Omit<NoMatchesTextTestCase, 'filter'> {
        readonly filter?: IFilterResult;
      }
      const initialStateTestCases: readonly InitialStateTestCase[] = [
        ...commonTestCases,
        {
          name: 'does not show text given no filter',
          filter: undefined,
          shouldNoMatchesExist: false,
        },
      ];
      initialStateTestCases.forEach(({ name, filter, shouldNoMatchesExist }) => {
        it(name, () => {
          // arrange
          const expected = shouldNoMatchesExist;
          const stateStub = new UseCollectionStateStub()
            .withFilterResult(filter);

          // act
          const wrapper = mountComponent({
            useCollectionState: stateStub.get(),
          });

          // expect
          const actual = wrapper.find(DOM_SELECTOR_NO_MATCHES).exists();
          expect(actual).to.equal(expected);
        });
      });
    });
    describe('on state change', () => {
      commonTestCases.forEach(({ name, filter, shouldNoMatchesExist }) => {
        it(name, async () => {
          // arrange
          const expected = shouldNoMatchesExist;
          const filterStub = new UserFilterStub();
          const stateStub = new UseCollectionStateStub()
            .withFilter(filterStub);
          const wrapper = mountComponent({
            useCollectionState: stateStub.get(),
          });

          // act
          filterStub.notifyFilterChange(FilterChangeDetailsStub.forApply(
            filter,
          ));
          await wrapper.vm.$nextTick();

          // expect
          const actual = wrapper.find(DOM_SELECTOR_NO_MATCHES).exists();
          expect(actual).to.equal(expected);
        });
      });
      it('shows no text if filter is removed after matches', async () => {
        // arrange
        const filter = new UserFilterStub();
        const stub = new UseCollectionStateStub()
          .withFilter(filter);
        const wrapper = mountComponent({
          useCollectionState: stub.get(),
        });

        // act
        filter.notifyFilterChange(FilterChangeDetailsStub.forApply(
          new FilterResultStub().withSomeMatches(),
        ));
        filter.notifyFilterChange(FilterChangeDetailsStub.forClear());
        await wrapper.vm.$nextTick();

        // expect
        expect(wrapper.find(DOM_SELECTOR_NO_MATCHES).exists()).to.equal(false);
      });
    });
  });
});

function expectComponentsToNotExist(wrapper: VueWrapper, components: readonly Component[]) {
  const existingUnexpectedComponents = components
    .map((component) => wrapper.findComponent(component))
    .filter((component) => component.exists());
  expect(existingUnexpectedComponents).to.have.lengthOf(0);
}

function mountComponent(options?: {
  readonly useCollectionState?: ReturnType<typeof useCollectionState>,
  readonly viewType?: ViewType,
}) {
  return shallowMount(TheScriptsView, {
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]:
          () => options?.useCollectionState ?? new UseCollectionStateStub().get(),
        [InjectionKeys.useApplication.key]:
          new UseApplicationStub().get(),
        [InjectionKeys.useAutoUnsubscribedEvents.key]:
          () => new UseAutoUnsubscribedEventsStub().get(),
      },
    },
    props: {
      currentView: options?.viewType === undefined ? ViewType.Tree : options.viewType,
    },
  });
}
