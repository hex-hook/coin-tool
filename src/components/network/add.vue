<script setup lang="ts">
import { useMessage, NCard, NSpace, NButton, NInput, NSwitch, NInputNumber } from 'naive-ui'
import { ref } from 'vue';
import { useWalletStore } from '@/stores/wallet'

interface Emits {
    (e: 'close'): void
}

const walletStore = useWalletStore()
const message = useMessage()
const emit = defineEmits<Emits>()

const chainId = ref(1)
const name = ref('')
const nativeCurrency = ref('')
const domain = ref('')
const subdomain = ref('api')
const rpcUrl = ref('')
const blockExplorerUrl = ref('')
const imageUrl = ref('')
const isTest = ref(true)

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
    const index = walletStore.networks.findIndex(item => item.chainId == convert16(chainId.value))
    if (index >= 0) {
        message.error('Chain is already exist')
        return false
    }
    return true
}


function save() {
    if (!checkData()) {
        return
    }
    walletStore.addNetwork({
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

</script>

<template>
    <n-card :style="{width:'600px'}">
        <n-space vertical>
            <n-space justify="center">
                <h3>Add Network</h3>  
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
                <div class="label">VativeCurrency</div>
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