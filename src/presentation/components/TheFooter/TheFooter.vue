<template>
  <div>
    <div class="footer">
      <div class="footer__section">
        <span v-if="isDesktop" class="footer__section__item">
          <font-awesome-icon class="icon" :icon="['fas', 'globe']"  />
          <span>Online version at <a :href="homepageUrl" target="_blank">{{ homepageUrl }}</a></span>
        </span>
        <span v-else class="footer__section__item">
          <DownloadUrlList />
        </span>
      </div>
      <div class="footer__section">
        <div class="footer__section__item">
          <a :href="feedbackUrl" target="_blank">
            <font-awesome-icon class="icon" :icon="['far', 'smile']"  />
            <span>Feedback</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="repositoryUrl" target="_blank">
            <font-awesome-icon class="icon" :icon="['fab', 'github']"  />
            <span>Source Code</span>
          </a>
        </div>
        <div class="footer__section__item">
          <a :href="releaseUrl" target="_blank">
            <font-awesome-icon class="icon" :icon="['fas', 'tag']"  />
            <span>v{{ version }}</span>
          </a>
        </div>
        <div class="footer__section__item">
          <font-awesome-icon class="icon" :icon="['fas', 'user-secret']"  />
          <a @click="$refs.privacyDialog.show()">Privacy</a>
        </div>
      </div>
    </div>
    <Dialog ref="privacyDialog">
        <PrivacyPolicy />
    </Dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Environment } from '@/application/Environment/Environment';
import PrivacyPolicy from './PrivacyPolicy.vue';
import Dialog from '@/presentation/components/Shared/Dialog.vue';
import DownloadUrlList from './DownloadUrlList.vue';
import { IApplication } from '@/domain/IApplication';
import { ApplicationFactory } from '@/application/ApplicationFactory';

@Component({
  components: {
    Dialog, PrivacyPolicy, DownloadUrlList,
  },
})
export default class TheFooter extends Vue {
  public readonly isDesktop = Environment.CurrentEnvironment.isDesktop;

  public version: string = '';
  public repositoryUrl: string = '';
  public releaseUrl: string = '';
  public feedbackUrl: string = '';
  public homepageUrl: string = '';

  public async created() {
    const app = await ApplicationFactory.Current.getAppAsync();
    this.initialize(app);
  }

  private initialize(app: IApplication) {
    const info = app.info;
    this.version = info.version;
    this.homepageUrl = info.homepage;
    this.repositoryUrl = info.repositoryWebUrl;
    this.releaseUrl = info.releaseUrl;
    this.feedbackUrl = info.feedbackUrl;
  }
}

</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";
@import "@/presentation/styles/media.scss";

.icon {
  margin-right: 0.5em;
  text-decoration: none;
}

.footer {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: $big-screen-width) {  
    flex-direction: column;
    align-items: center;
  }
  &__section {
    display: flex;
    @media screen and (max-width: $big-screen-width) {  
      justify-content: space-around;
      width:100%;  
      &:not(:first-child) {
        margin-top: 0.7em;
      }
    }
    flex-wrap: wrap;
    color: $dark-gray;
    font-size: 1rem;
    font-family: $normal-font;
    a {
      color:inherit;
      text-decoration: underline;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
    }
    &__item:not(:first-child) {
      &::before {
        content: "|";
        padding: 0 5px;
      }
      @media screen and (max-width: $big-screen-width) {  
        margin-top: 3px;
        &::before {
          content: "";
          padding: 0;
        }
      }
    }
  }
}
.modal {
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;

    &__content {
      width: 100%;
    }

    &__close-button {
      width: auto;
      font-size: 1.5em;
      margin-right:0.25em;
      align-self: flex-start;
      cursor: pointer;
      &:hover {
        opacity: 0.9;
      }
    }
}
</style>