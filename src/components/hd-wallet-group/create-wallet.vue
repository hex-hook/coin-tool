<script setup lang="ts">
// create hd wallet
// - input wallet name and accounts count
// - create hd wallet and show mnemonic

import { useMessage, NInput, NCard, NSpace, NButton, NInputNumber } from 'naive-ui'
import { useKeyStore } from '@/stores/key';
import { useWalletStore } from '@/stores/wallet';
import { ref } from 'vue';

interface Emits {
    (e: 'close'): void
}

const message = useMessage()
const emit = defineEmits<Emits>()
const keyStore = useKeyStore()
const walletStore = useWalletStore()

const name = ref('')
const count = ref(10)

const mnemonic = ref('')

function close() {
    emit('close')
}

function createWallet() {
    if (!name.value) {
        message.warning('name is empty')
        return
    }

    try {
        const res = keyStore.createHDWallet(count.value)
        const [ words, address ] = res
        mnemonic.value = words
        const lastId = walletStore.groups.map(item => item.id).sort((a, b) => b - a)[0]
        console.log(lastId, name.value, address, words)
        walletStore.addGroup({
            id: lastId+1,
            name: name.value,
            address,
            description: ''
        })
        
    } catch (error: any) {
        message.error(error.message)
        return
    }

}
</script>

<template>
    <n-card style="width: 600px">

        <n-space vertical>
            <n-space>
                <h3>Create HD Wallet</h3>
            </n-space>
            <div>Wallet Name</div>
            <n-input v-model:value="name" :disabled="mnemonic!=''" />
            <div>Accounts</div>
            <n-input-number v-model:value="count" :min="1" :max="100" :disabled="mnemonic!=''" />
            <n-space v-if="mnemonic==''">
                <n-button type="warning" round @click="close">Cancel</n-button>
                <n-button type="primary" round @click="createWallet">Create</n-button>
            </n-space>
            <n-space v-else vertical>
                <div>Mnemonic</div>
                <div>{{ mnemonic }}</div>
                <n-button type="error" round @click="close">Confirm</n-button>
            </n-space>
        </n-space>
    </n-card>
</template>