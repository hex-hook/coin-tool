<script setup lang="ts">
import { NButton, NPopselect, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { useChainStore } from '@/stores/chain'


const message = useMessage()
const chainStore = useChainStore()


const networkOptions = computed(() => chainStore.networks.map(item => ({value: item.chainId, label: item.name})))

const current = ref(chainStore.activeChainId)

watch(current, () => {
    const network = chainStore.networks.find(item => item.chainId == current.value)
    if (!network) {
        message.error(`not found network by chain id: [${current.value}], Please make sure it exists.`)
        return
    }
    chainStore.updateActiveNetwork(network.chainId)
    message.success(`switch to ${network.name} success`)
})
    
const networkInfo = computed(() => {
    const network = chainStore.networks.find(item => item.chainId == current.value)
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