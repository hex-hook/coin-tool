<script setup lang="ts">
import { NModal, NCard, NSpace, NIcon, NButton } from 'naive-ui'
import { Sunny, MoonOutline, SettingsSharp, LockClosed, LockOpen } from '@vicons/ionicons5'
import { computed, ref, watch } from 'vue';
import Network from './network.vue';
import { useKeyStore } from '@/stores/key';
import Verify from './verify.vue'

interface Emits {
    (e: 'updateTheme'): void
}

const emit = defineEmits<Emits>()
const keyStore = useKeyStore()

const isDark = ref(false)
const showModal = ref(false)
const isLock = computed(() => keyStore.isLock)


watch(isDark, () => {
    emit('updateTheme')
})

function lockHandle() {
    if (!isLock.value) {
        keyStore.clearKey()
        return
    }
}

</script>

<template>
    <n-space justify="center" :style="{height: '60px'}">
        <n-modal v-model:show="isLock" :mask-closable="false">
            <Verify  />
        </n-modal>
        <n-card :style="{ width: '600px', height: '40px', borderRadius: '20px' }" :content-style="{padding: '2px'}">
            <n-space justify="center" align="center" :style="{height: '100%'}">
                <Network />
                <n-button text style="font-size: 24px;display: flex;" @click="isDark = !isDark">
                    <n-icon>
                        <MoonOutline v-if="isDark" color="white"/>
                        <Sunny v-else color="black"/>
                    </n-icon>
                </n-button>

                <n-button text style="font-size: 24px;display: flex;" @click="lockHandle">
                    <n-icon>
                        <LockClosed v-if="isLock" />
                        <LockOpen v-else />
                    </n-icon>
                </n-button>
                <n-button text style="font-size: 24px;display: flex;" @click="showModal=true">
                    <n-icon><SettingsSharp/></n-icon>
                </n-button>
            </n-space>
        </n-card>
    </n-space>
</template>