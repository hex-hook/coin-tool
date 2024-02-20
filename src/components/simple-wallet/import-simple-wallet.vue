<script setup lang="ts">
import { NSelect, NCard, NInput, NButton, NSpace, useMessage } from 'naive-ui'
import { useWalletStore } from '@/stores/wallet'
import { useKeyStore } from '@/stores/key'
import { computed, ref } from 'vue';
import { ethers } from 'ethers';

interface Props {
    address: string
}

interface Emits {
    (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const walletStore = useWalletStore()
const keyStore = useKeyStore()
const message = useMessage()

const groupOptions = computed(() => walletStore.groups.map(item => ({label: item.name, value: item.id})))

const privateKey = ref('')
const name = ref()
const selectedGroup = ref(walletStore.groups[0].id)

function checkAddress(): boolean {
    let address = ''
    try {
        address = new ethers.Wallet(privateKey.value).address
    } catch (err: any) {
        message.error(err.message)
        return false
    }
    if (props.address.length>0 && address != props.address) {
        message.error('private key is not match address')
        return false
    }
    return true
}

// update simple wallet store record
// 1. if props.address is exist, then return
// 2. if props.address is not exist, then add new record, get group by selectedGroup
function updateWallet(address: string, name: string|undefined) {
    const index = walletStore.wallets.findIndex(item => item.address == address)
    const item = {
            name: name || `account-${walletStore.wallets.length + 1}`,
            address,
            group: selectedGroup.value,
            createdAt: Date.now(),
            hasPrivateKey: true
        }
    if (index < 0) {
        walletStore.add(item)
    } else {
        walletStore.update(item)
    }
}

function close() {
    emit('close')
}

async function importPrivateKey() {
    if (privateKey.value.length != 64) {
        message.error('private key is invalid')
        return
    }
    // private key to address
    if (!checkAddress()) {
        return
    }
    let address = ''
    try {
        address = keyStore.importPrivateKey(privateKey.value)
    } catch(e: any) {
        message.error(e.message)       
        return
    }
    
    updateWallet(address, name.value)
    close()
}


</script>
<template>
    <n-card style="width: 500px;">
        <n-space vertical>
            <h3>Import Private Key</h3>
          
            <template v-if="props.address.length == 0">
                <div class="label">Name</div>
                <n-input v-model:value="name" />
            </template>
            <template v-else>
                <div class="label">Address</div>
                <div>{{ props.address }}</div>
            </template>
            
            <div class="label">Private Key</div>
            <n-input v-model:value="privateKey" />
            <template v-if="props.address.length == 0">
                <div class="label">Group</div>
                <n-select v-model:value="selectedGroup" :options="groupOptions" />
            </template>
            <n-space justify="center">
                <n-button type="warning" round @click="close">Cancel</n-button>
                <n-button type="primary" round @click="importPrivateKey">Import</n-button>
            </n-space>
        </n-space>
    </n-card>
</template>