<script setup lang="ts">
import { useMessage, NCard, NSpace, NButton, NInput, NSwitch, NInputNumber } from 'naive-ui'
import { onMounted, ref } from 'vue';
import { useChainStore } from '@/stores/chain'
import { DEFAULT_NETWORKS } from '@/assets/network'


interface Emits {
    (e: 'close'): void
}

interface Props {
    id?: string
}

const chainStore = useChainStore()
const message = useMessage()
const emit = defineEmits<Emits>()
const props = defineProps<Props>()

const resettable = ref(DEFAULT_NETWORKS.findIndex(item => item.chainId == props.id) >= 0)

const chainId = ref(1)
const chainIdDisabled = ref(false)
const name = ref('')
const nativeCurrency = ref('')
const domain = ref('')
const subdomain = ref('api')
const rpcUrl = ref('')
const blockExplorerUrl = ref('')
const imageUrl = ref('')
const isTest = ref(true)

onMounted(() => {
    if (!props.id) {
        return
    }
    chainId.value = parseInt(props.id)
    const item = chainStore.networks.find(item => item.chainId == props.id)
    if (item) {
        chainIdDisabled.value = true
        name.value = item.name
        nativeCurrency.value = item.nativeCurrency
        domain.value = item.domain
        subdomain.value = item.subdomain
        rpcUrl.value = item.rpcUrl
        blockExplorerUrl.value = item.blockExplorerUrl
        imageUrl.value = item.imageUrl
        isTest.value = item.isTest
    }
})

function close() {
    emit('close')
}

function convert16(n: number): string {
    const str = `${n}`
    return `0x${parseInt(str).toString(16)}`
}

function checkData(): boolean {
    if (chainId.value == 0) {
        message.error('Chain Id is 0')
        return false
    }
    if (rpcUrl.value == '') {
        message.error('rpc url is null')
        return false
    }
    if (name.value == '') {
        message.error('name is null')
        return false
    }
    if (nativeCurrency.value == '') {
        message.error('nativeCurrency is null')
        return false
    }
    return true
}


function save() {
    if (!checkData()) {
        return
    }
    chainStore.updateNetwork({
        chainId: convert16(chainId.value),
        name: name.value,
        nativeCurrency: nativeCurrency.value,
        domain: domain.value,
        subdomain: subdomain.value,
        rpcUrl: rpcUrl.value,
        blockExplorerUrl: blockExplorerUrl.value,
        imageUrl: imageUrl.value,
        isTest: isTest.value
    })
    close()
}

function resetNetwork() {
    if (props.id) {
        const item = DEFAULT_NETWORKS.find(item => item.chainId == props.id)
        if (item) {
            chainId.value = parseInt(item.chainId)
            name.value = item.name
            nativeCurrency.value = item.nativeCurrency
            domain.value = item.domain
            subdomain.value = item.subdomain
            rpcUrl.value = item.rpcUrl
            blockExplorerUrl.value = item.blockExplorerUrl
            imageUrl.value = item.imageUrl
            isTest.value = item.isTest
        }
    }
}

</script>

<template>
    <n-card :style="{width:'600px'}">
        <n-space vertical>
            <n-space justify="center" align="center">
                <h3>{{ props.id ? 'Update' : 'Add' }} Network</h3>  
                <n-button round v-if="resettable" @click="resetNetwork" type="info" size="small">Reset</n-button>
            </n-space>
            <n-space align="center">
                <div class="label">Id</div>
                <n-input-number v-model:value="chainId" :precision="0" :min="1" :show-button="false" :style="{width: '300px'}"/>
            </n-space>
            <n-space align="center">
                <div class="label">Name</div>
                <n-input v-model:value="name" :style="{width: '300px'}"/>
            </n-space>
            <n-space align="center">
                <div class="label">NativeCurrency</div>
                <n-input v-model:value="nativeCurrency" :style="{width: '300px'}"/>
            </n-space>
            <n-space align="center">
                <div class="label">Domain</div>
                <n-input v-model:value="domain" :style="{width: '300px'}"/>
            </n-space>
            <n-space align="center">
                <div class="label">RpcUrl</div>
                <n-input v-model:value="rpcUrl" :style="{width: '300px'}"/>
            </n-space>
            <n-space align="center">
                <div class="label">BlockExplorerUrl</div>
                <n-input v-model:value="blockExplorerUrl" :style="{width: '300px'}"/>
            </n-space>
            <n-space align="center">
                <div class="label">Test Network</div>
                <n-switch v-model:value="isTest" />
            </n-space>
            <n-space justify="center">
                <n-button type="warning" round @click="close">Cancel</n-button>
                <n-button type="primary" round @click="save">Save</n-button>
            </n-space>
        </n-space>
    </n-card>
</template>

<style scoped>
div.label {
    width: 150px;
}
</style>