<script setup lang="ts">
import { useMessage, NCard, NSpace, NInput, NButton } from 'naive-ui'
import { onMounted, ref } from 'vue';
import { useWalletStore } from '@/stores/wallet';

interface Props {
    id: number
}

interface Emits {
    (e: 'close'): void
}

const message = useMessage()
const walletStore = useWalletStore()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const name = ref('')
const description = ref('')


onMounted(() => {
    if (props.id == 0) {
        return
    }
    const item = walletStore.groups.find(item => item.id == props.id)
    if (item) {
        name.value = item.name
        description.value = item.description
    }
})


function close() {
    emit('close')
}

function save() {
    if (name.value.length == 0) {
        message.error('name is null')
        return
    }

    if (walletStore.groups.filter(item => item.id != props.id && item.name == name.value).length > 0) {
        message.error('name is already exist')
        return
    }
    let id = props.id
    if (id == 0) {
        id = generateId()
        walletStore.addGroup({
            id,
            name: name.value,
            description: description.value
        })
    } else {
        walletStore.updateGroup({
            id: props.id,
            name: name.value,
            description: description.value
        })
    }

    close()
}

function generateId(): number {
    const i = walletStore.groups.map(item => item.id).sort().reverse()[0]
    return i + 1
}
</script>

<template>
    <n-card :style="{ width: '600px' }">
        <n-space vertical>
            <div class="label">Name</div>
            <n-input v-model:value="name" :maxlength="10" show-count :minlength="2" />
            <div class="label">Description</div>
            <n-input v-model:value="description" :maxlength="50" show-count />
            <n-space>
                <n-button type="warning" @click="close" round>cancel</n-button>
                <n-button type="primary" @click="save" round>save</n-button>
            </n-space>
        </n-space>
    </n-card>
</template>