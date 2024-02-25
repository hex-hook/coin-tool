<script setup lang="ts">
// this is more HD wallet manage page
// - a HD wallet table
// - table show wallet name, options
// - support change wallet name, delete wallet
// - support add wallet
// - support import wallet
// - support export wallet

import { NInput, useDialog, useMessage, NSpace, NTable, NCard, NButton, NIcon, NModal } from 'naive-ui'
import { useKeyStore } from '@/stores/key'
import { computed, ref } from 'vue';
import { Pencil, CheckmarkCircle } from '@vicons/ionicons5';
import ImportWallet from './import-wallet.vue'
import CreateWallet from './create-wallet.vue'
import { useWalletStore } from '@/stores/wallet';

const keyStore = useKeyStore()
const walletStore = useWalletStore()
const message = useMessage()
const dialog = useDialog()

const wallets = computed(() => walletStore.groups.filter(item => item.address))

const showCreateModal = ref(false)
const showImportModal = ref(false)

const newName = ref('')

const editIndex = ref(-1)


// delete hd wallet by index
async function deleteHandle(index: number) {
    // show dialog to confirm
    dialog.error({
        title: 'Delete HD Wallet',
        content: `Are you sure to delete ${wallets.value[index].name}`,
        negativeText: 'Cancel',
        positiveText: 'Confirm',
        onPositiveClick: () => {
            keyStore.removeHDWallet(wallets.value[index].address as string)
        }
    })
}

function updateName(item: Wallet.Group) {
    if (!newName.value) {
        message.warning('name is empty')
        return
    }
    const existIndex = wallets.value.findIndex(o => o.name == newName.value)
    if (existIndex >= 0) {
        message.warning('name is already exist')
        return
    }
    item.name = newName.value
    walletStore.updateGroup(item)
    editIndex.value = -1
    newName.value = ''
}


</script>

<template>
    <n-card>

        <n-modal v-model:show="showImportModal">
            <ImportWallet @close="showImportModal=false" />
        </n-modal>
        <n-modal v-model:show="showCreateModal">
            <CreateWallet @close="showCreateModal=false" />
        </n-modal>
        <n-space vertical>
            <n-space>
                <n-button @click="showCreateModal = true" round type="info">Add HD Wallet</n-button>
                <n-button @click="showImportModal = true" round type="primary">Import HD Wallet</n-button>
            </n-space>
            <n-table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) of wallets" v-bind:key="item.id">
                        <td>                            
                            <n-space v-if="editIndex != index" align="center">
                                <div>{{ item.name }}</div>
                                <n-button text style="font-size:24px" @click="editIndex=index">
                                    <n-icon><Pencil/></n-icon>
                                </n-button>
                            </n-space>
                            <n-space v-else align="center">
                                <n-input v-model:value="newName" />
                                <n-button text style="font-size:24px" @click="updateName(item)">
                                    <n-icon><CheckmarkCircle/></n-icon>
                                </n-button>
                            </n-space>
                        </td>
                        <td></td>
                        <td>
                            <n-space>
                                <n-button type="error" @click="deleteHandle(index)" round>Delete</n-button>
                            </n-space>
                        </td>
                    </tr>
                </tbody>
            </n-table>
        </n-space>
    </n-card>
</template>