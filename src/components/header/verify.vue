<script setup lang="ts">
import { NInput, NCard, NSpace, NButton, useMessage } from 'naive-ui'
import { useKeyStore } from '@/stores/key';
import { computed, ref } from 'vue';



const keyStore = useKeyStore()
const message = useMessage()

const isCreated = computed(()=>keyStore.isCreated)

const password = ref('')

function createFirst() {
    if (password.value == '') {
        message.error('Password is null')
        return
    }
    if (isCreated.value) {
        return
    }
    keyStore.initWallet(password.value)
}

function verifyPassword() {
    if (!password.value) return
    try {

        keyStore.verify(password.value)
    } catch(err: any) {
        message.error(err.message)
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
            <n-button round type="primary" @click="createFirst">Create</n-button>
        </n-space>
    </n-card>
</template>