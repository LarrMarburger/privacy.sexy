<template>
  <div>
    <div class="footer">
      <div class="footer__section">
        <span v-if="isDesktop" class="footer__section__item">
          <AppIcon class="icon" icon="globe" />
          <span>
            Online version at <a :href="homepageUrl" target="_blank" rel="noopener noreferrer">{{ homepageUrl }}</a>
          </span>
        </span>
        <span v-else class="footer__section__item">
          <DownloadUrlList />
        </span>
      </div>
      <div class="footer__section">
        <div class="footer__section__item">
          <a :href="feedbackUrl" target="_blank" rel="noopener noreferrer">
            <AppIcon class="icon" icon="face-smile" />
            <span>Feedback</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="repositoryUrl" target="_blank" rel="noopener noreferrer">
            <AppIcon class="icon" icon="github" />
            <span>Source Code</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="releaseUrl" target="_blank" rel="noopener noreferrer">
            <AppIcon class="icon" icon="tag" />
            <span>v{{ version }}</span>
          </a>
        </div>
        <div class="footer__section__item">
          <AppIcon class="icon" icon="user-secret" />
          <a @click="showPrivacyDialog()">Privacy</a>
        </div>
      </div>
    </div>
    <ModalDialog v-model="isPrivacyDialogVisible">
      <PrivacyPolicy />
    </ModalDialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed,
} from 'vue';
import ModalDialog from '@/presentation/components/Shared/Modal/ModalDialog.vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import DownloadUrlList from './DownloadUrlList.vue';
import PrivacyPolicy from './PrivacyPolicy.vue';

export default defineComponent({
  components: {
    ModalDialog,
    PrivacyPolicy,
    DownloadUrlList,
    AppIcon,
  },
  setup() {
    const { info } = injectKey((keys) => keys.useApplication);
    const { isDesktop } = injectKey((keys) => keys.useRuntimeEnvironment);

    const isPrivacyDialogVisible = ref(false);

    const version = computed<string>(() => info.version.toString());

    const homepageUrl = computed<string>(() => info.homepage);

    const repositoryUrl = computed<string>(() => info.repositoryWebUrl);

    const releaseUrl = computed<string>(() => info.releaseUrl);

    const feedbackUrl = computed<string>(() => info.feedbackUrl);

    function showPrivacyDialog() {
      isPrivacyDialogVisible.value = true;
    }

    return {
      isDesktop,
      isPrivacyDialogVisible,
      showPrivacyDialog,
      version,
      homepageUrl,
      repositoryUrl,
      releaseUrl,
      feedbackUrl,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.icon {
  margin-right: 0.5em;
  text-decoration: none;
}

.footer {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: $media-screen-big-width) {
    flex-direction: column;
    align-items: center;
  }
  &__section {
    display: flex;
    @media screen and (max-width: $media-screen-big-width) {
      justify-content: space-around;
      width: 100%;
      &:not(:first-child) {
        margin-top: 0.7em;
      }
    }
    flex-wrap: wrap;
    font-size: 1rem;
    font-family: $font-normal;
    &__item:not(:first-child) {
      &::before {
        content: "|";
        padding: 0 5px;
      }
      @media screen and (max-width: $media-screen-big-width) {
        margin-top: 3px;
        &::before {
          content: "";
          padding: 0;
        }
      }
    }
  }
}
</style>
