<script setup lang="ts">
import { NButton, NPopselect, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { useWalletStore } from '@/stores/wallet';


const message = useMessage()
const walletStore = useWalletStore()


const networkOptions = computed(() => walletStore.networks.map(item => ({value: item.chainId, label: item.name})))

const current = ref(walletStore.activeNetwork)

watch(current, () => {
    const network = walletStore.networks.find(item => item.chainId == current.value)
    if (!network) {
        message.error(`not found network by chain id: [${current.value}], Please make sure it exists.`)
        return
    }
    walletStore.updateNetwork(network.chainId)
    message.success(`switch to ${network.name} success`)
})
    
const networkInfo = computed(() => {
    const network = walletStore.networks.find(item => item.chainId == current.value)
    if (!network) {
        return null
    }
    return network
})

</script>

<template>
    <n-popselect :options="networkOptions"  v-model:value="current">
        <n-button :style="{width: '260px', height: '24px'}" round>{{ networkInfo?.name ?? 'failed' }}</n-button>       
    </n-popselect>
</template>