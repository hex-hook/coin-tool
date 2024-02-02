<script setup lang="ts">
// import hd wallet by mnemonic
// - input wallet name and mnemonic
// default inport 10 accounts, can change it
import { useMessage, NInput, NCard, NSpace, NButton, NInputNumber } from 'naive-ui'
import { ref } from 'vue';
import { useKeyStore } from '@/stores/key';

// close modal emit
// 1. define a interface by emit
interface Emits {
    (e: 'close'): void
}

const message = useMessage()
const keyStore = useKeyStore()
const emit = defineEmits<Emits>()

// 2. set value save name and mnemonic, account count
const name = ref('')
const mnemonic = ref('')
const count = ref(10)

function close() {
    emit('close')
}

// import wallet
function importWallet() {
    // check name and mnemonic
    // name is not empty and exist
    if (!name.value) {
        message.warning('name is empty')
        return
    }
    if (keyStore.hdWallet.find(item => item.name == name.value)) {
        message.warning('name is already exist')
        return
    }
    if (!mnemonic.value) {
        message.warning('mnemonic is empty')
        return
    }
    try {
        keyStore.createHDWallet(name.value, count.value, mnemonic.value)
    } catch (error: any) {
        message.error(error.message)
        return
    }
    message.success('import success')
    close()
}

</script>

<template>
    <n-card style="width: 600px">
        <n-space vertical >
            <n-space justify="center">
                <h3>Import HD Wallet</h3>
            </n-space>
            <div>Wallet Name</div>
            <n-input v-model:value="name" />
            <div>Mnemonic</div>
            <n-input v-model:value="mnemonic" />
            <div>accounts</div>
            <n-input-number v-model:value="count" :min="1" :max="500" />
            <n-space justify="center">
                <n-button type="warning" round @click="close">Cancel</n-button>
                <n-button type="primary" round @click="importWallet">Import</n-button>
            </n-space>
        </n-space>
    </n-card>
</template>