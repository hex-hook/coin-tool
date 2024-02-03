<script setup lang="ts">
import { NCard, NInput, NSpace, NInputNumber, NButton, useMessage } from 'naive-ui'
import { ref } from 'vue';
import { useChainStore } from '@/stores/chain'
import { useProvider, useERC20ByProvider } from '@/hooks/provider';

interface Emits {
    (e: 'import'): void
}

const message = useMessage()

const chainStore = useChainStore()

const provider = useProvider()

const emit = defineEmits<Emits>()

const address = ref('')
const name = ref('')
const symbol = ref('')
const decimals = ref(-1)

const buttonDisable = ref(true)
const addressDisable = ref(false)




async function updateHandle() {
    clearData()
    const contractAddress = address.value
    if (contractAddress.length == 0) return
    if (contractAddress.length != 42 || !contractAddress.startsWith('0x')) {
        message.warning('contract address is failed')
        return
    }
    addressDisable.value = true
    await getInfo(contractAddress)
}

function clearData() {
    name.value = ''
    symbol.value = ''
    decimals.value = -1
    buttonDisable.value = true
}

async function getInfo(contractAddress: string) {
    const contract = useERC20ByProvider(contractAddress, provider.value)
    try {
        const tokenName = await contract.name()
        name.value = `${tokenName}`

        const tokenSymbol = await contract.symbol()
        symbol.value = `${tokenSymbol}`

        const tokenDecimals = await contract.decimals()
        decimals.value = parseInt(`${tokenDecimals}`)
        buttonDisable.value = false
    }catch(err){
        message.error(`${err}`)
    } finally {
        addressDisable.value = false
    }
}

function addToken() {
    chainStore.addToken({
        address: address.value,
        name: name.value,
        symbol: symbol.value,
        decimals: decimals.value,
        chainId: chainStore.activeChainId
    })
    emit('import')
}

</script>

<template>
    <n-card title="add token" :style="{maxWidth:'600px'}">
        <n-space vertical>
            <div>
                <div class="label">contract address</div>
                <n-input v-model:value="address" @input="updateHandle" :disabled="addressDisable"/>
            </div>
            <div v-if="name.length > 0">
                <div class="label">name</div>
                <n-input v-model:value="name" disabled/>
            </div>
            <div v-if="symbol.length > 0">
                <div class="label">symbol</div>
                <n-input v-model:value="symbol" disabled/>
            </div>
            <div v-if="decimals > -1">
                <div class="label">decimals</div>
                <n-input-number v-model:value="decimals" disabled />
            </div>
            <n-button type="primary" @click="addToken" :disabled="buttonDisable">save</n-button>
        </n-space>
    </n-card>

</template>