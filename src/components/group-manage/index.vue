<script setup lang="ts">
import { useDialog, useMessage, NSpace, NTable, NCard, NButton, NModal } from 'naive-ui'
import { computed, ref } from 'vue';
import { useWalletStore } from '@/stores/wallet'
import Detail from './detail.vue'

const walletStore = useWalletStore()
const dialog = useDialog()
const message = useMessage()

const modalState = ref(false)

const groups = computed(() => walletStore.groups)

const editId = ref(0)


function deleteHandle(id: number, name: string) {
    const wallets = walletStore.wallets.filter(item => item.group == id)
    if (wallets.length > 0) {
        message.error('当前组中还存在钱包，请先清除否则无法删除该组')
        return
    }
    dialog.error({
        title: '删除组确认',
        content: `是否删除 ${name}`,
        negativeText: '取消',
        positiveText: '确定',
        onPositiveClick: () => {
            walletStore.deleteGroup(id)
        }
    })
}

function editHandle(id: number) {
    editId.value = id
    modalState.value = true
}

function closeModal() {
    modalState.value = false
    editId.value = 0
}

</script>

<template>
    <n-card>
        <n-modal v-model:show="modalState">
            <Detail :id="editId" @close="closeModal"/>
        </n-modal>
        <n-space vertical>
            <n-space>
                <n-button type="primary" @click="editHandle(0)" round>Add</n-button>
            </n-space>
            <n-table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Option</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item of groups">
                        <td>{{ item.name }}</td>
                        <td>{{ item.description }}</td>
                        <td>
                            <n-space>
                                <n-button type="info" @click="editHandle(item.id)" round>Edit</n-button>
                                <n-button type="error" @click="deleteHandle(item.id, item.name)" round>Delete</n-button>
                            </n-space>
                        </td>
                    </tr>
                </tbody>
            </n-table>
        </n-space>
    </n-card>
</template>