<script setup lang="ts">
import WalletIndex from '@/components/wallet/index.vue'
import ToolsIndex from '@/components/tools/index.vue'
import { NTabs, NTabPane, NMessageProvider, NDialogProvider, NLayout, NLayoutContent, NLayoutHeader, NConfigProvider, darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'
import { ref } from 'vue';
import HeaderIndex from '@/components/header/index.vue'

const theme = ref<GlobalTheme|null>(null)

function updateTheme() {
  if (theme.value) {
    theme.value = null
  } else {
    theme.value = darkTheme
  }
}

</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <n-dialog-provider>
        <n-layout :style="{height: '100vh', padding: '10px'}">
          <n-layout-header>
            <HeaderIndex @update-theme="updateTheme" />
          </n-layout-header>
          <n-layout-content>
            <n-tabs type="segment">
              <n-tab-pane tab="Wallet" name="wallet" display-directive="show">
                <WalletIndex />
              </n-tab-pane>
              <n-tab-pane tab="Tools" name="tools" display-directive="show">
                <ToolsIndex />
              </n-tab-pane>

            </n-tabs>
          </n-layout-content>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped></style>
