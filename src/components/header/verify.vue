<script setup lang="ts">
import { NInput, NCard, NSpace, NButton, useMessage } from 'naive-ui'
import { useKeyStore } from '@/stores/key';
import { computed, ref } from 'vue';
import { useWalletStore } from '@/stores/wallet';



const keyStore = useKeyStore()
const walletStore = useWalletStore()
const message = useMessage()

const isCreated = computed(()=>keyStore.isCreated)

const password = ref('')
const newMnemonic = ref('')

function createFirst() {
    if (password.value == '') {
        message.error('Password is null')
        return
    }
    if (isCreated.value) {
        return
    }
    const [mnemonic, address] = keyStore.initWallet(password.value)
    newMnemonic.value = mnemonic
    walletStore.addGroup({
        id: 0,
        name: 'hd-wallet-0',
        address,
        description: '',
    })
}

function verifyPassword() {
    if (!password.value) return

    try {

        keyStore.verify(password.value)
    } catch (error) {
        message.error('Password is wrong')
        return
    }
}
</script>

<template>
    <n-card :style="{width: '600px'}">
      
        <n-space v-if="isCreated" vertical justify="center">
            <div>Password verify</div>
            <n-input type="password" v-model:value="password" />
            <n-button round type="primary" @click="verifyPassword">Verify</n-button>
        </n-space>
        <n-space v-else vertical justify="center">
            <div>Create Account</div>
            <n-input type="password" v-model:value="password" />
            <n-button v-if="newMnemonic==''" round type="primary" @click="createFirst">Create</n-button>
            <template v-else>
                <div>mnemonic</div>
                <p>{{ newMnemonic }}</p>
                <n-button @click="keyStore.confirmCreate()" type="warning" round>Confirm</n-button>
            </template>
        </n-space>
    </n-card>
</template>