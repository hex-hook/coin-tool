<script setup lang="ts">
import { useMessage, NSpace, NInput, NButton, NCard } from 'naive-ui'
import { onMounted, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings'

interface Emits{
    (e: 'close'): void
}

const emit = defineEmits<Emits>()
const message = useMessage()
const settingsStore = useSettingsStore()

const provider = ref('')
const endpoint = ref('')

function closeHandle() {
    emit('close')
}

onMounted(() => {
    provider.value = settingsStore.provider
    endpoint.value = settingsStore.endpoint
})

function saveHandle() {
    if (!provider.value) {
        message.error('provider is null')
        return
    }
    if (!endpoint.value) {
        message.error('endpoint is null')
        return
    }
    settingsStore.update({provider: provider.value, endpoint: endpoint.value})
    closeHandle()
}
</script>

<template>
    <n-card :style="{width: '600px'}">
        <n-space vertical>
            <n-space>
                <div class="label">Provider</div>
                <n-input v-model:value="provider" />
            </n-space>

            <n-space>
                <div class="label">Endpoint</div>
                <n-input v-model:value="endpoint" />
            </n-space>
            <n-space justify="center">
                <n-button type="info" @click="closeHandle" round>Cancel</n-button>
                <n-button type="primary" @click="saveHandle" round>Save</n-button>
            </n-space>
        </n-space>
        
    </n-card>
</template>
<style scoped>
div.label {
    width: 100px;
}
</style>