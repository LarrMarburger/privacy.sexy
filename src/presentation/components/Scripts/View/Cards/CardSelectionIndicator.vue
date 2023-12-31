<template>
  <div>
    <AppIcon
      icon="battery-half"
      v-if="isAnyChildSelected && !areAllChildrenSelected"
    />
    <AppIcon
      icon="battery-full"
      v-if="areAllChildrenSelected"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { ICategory } from '@/domain/ICategory';
import { ICategoryCollection } from '@/domain/ICategoryCollection';

export default defineComponent({
  components: {
    AppIcon,
  },
  props: {
    categoryId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { currentState } = injectKey((keys) => keys.useCollectionState);
    const { currentSelection } = injectKey((keys) => keys.useUserSelectionState);
    const currentCollection = computed<ICategoryCollection>(() => currentState.value.collection);

    const currentCategory = computed<ICategory>(
      () => currentCollection.value.getCategory(props.categoryId),
    );

    const isAnyChildSelected = computed<boolean>(
      () => currentSelection.value.isAnySelected(currentCategory.value),
    );

    const areAllChildrenSelected = computed<boolean>(
      () => currentSelection.value.areAllSelected(currentCategory.value),
    );

    return {
      isAnyChildSelected,
      areAllChildrenSelected,
    };
  },
});

</script>
