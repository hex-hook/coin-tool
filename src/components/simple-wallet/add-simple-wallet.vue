<script setup lang="ts">
import { NCard, NSpace, NInput, NButton, useMessage, NSelect } from 'naive-ui'
import { useWalletStore } from '@/stores/wallet'
import { computed, onMounted, ref } from 'vue';

interface Emits {
    (e: 'close'): void
}

const message = useMessage()

const walletStore = useWalletStore()

const emit = defineEmits<Emits>()

const name = ref('')
const address = ref('')
const group = ref()

const selectOption = computed(() => walletStore.groups.map(item => ({label: item.name, value: item.id})))
const nameState = ref(true)
const addressState = ref(false)

onMounted(() => {
    name.value = `account-${walletStore.wallets.length + 1}`
    group.value = walletStore.groups[0].id
})

function checkAddress(): boolean {
    addressState.value = false
    const cur = address.value.trim()
    if (cur.length != 42 && !cur.startsWith('0x')) {
        message.error('addres is failed')
        return false
    }
    const old = walletStore.wallets.find(item => item.address == cur)
    if (old) {
        message.error('addres is already exist')
        return false
    }
    addressState.value = true
    return true
}

function checkName(): boolean {
    nameState.value = false
    const cur = name.value.trim()
    if (cur == '') {
        message.error('name is null')
        return false
    }
    const old = walletStore.wallets.find(item => item.name == cur)
    if (old) {
        message.error('name is already exist')
        return false
    }
    nameState.value = true
    return true
}

function addHandle() {
    if (!checkAddress() || !checkName()) {
        return
    }
    walletStore.add({
        address: address.value.toLocaleLowerCase(),
        name: name.value,
        group: group.value,
        createdAt: Date.now(),
        hasPrivateKey: false
    })
    message.success('add address success')
    emit('close')
}


</script>

<template>
    <n-card :style="{ maxWidth: '600px' }">
        <n-space vertical >
            <div class="lable">Address</div>
            <n-input v-model:value="address" @input="checkAddress"  />
            <div class="lable">Name</div>
            <n-input v-model:value="name" @input="checkName" />
            <div class="label">group</div>
            <n-select v-model:value="group" :options="selectOption" />
            <n-space justify="center">
                <n-button type="success" @click="addHandle" :disabled="!(nameState && addressState)" round>save</n-button>
            </n-space>
        </n-space>
    </n-card>
</template>