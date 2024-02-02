<script setup lang="ts">
import { NTag, NSelect, NModal, NCard, NSpace, NInput, NTable, NButton, NIcon, useDialog, useMessage } from 'naive-ui'
import { Pencil, CheckmarkCircle } from '@vicons/ionicons5'
import { computed, onMounted, ref } from 'vue';
import AddSimpleWallet from './add-simple-wallet.vue'
import { useWalletStore } from '@/stores/wallet';
import { useKeyStore } from '@/stores/key';
import ImportSimpleWallet from './import-simple-wallet.vue';
import { getAddress } from 'ethers';

const dialog = useDialog()
const message = useMessage()

const keyStore = useKeyStore()
const walletStore = useWalletStore()

const editAddress = ref<string>('')
const newName = ref<string>('')



const showModal = ref(false)
const showImportModal = ref(false)

const groupList = computed(() => walletStore.groups.filter(o => o.id != 0).map(item => ({ label: item.name, value: item.id })))
const keyList = computed(() => keyStore.simpleAccounts)

const selectedGroup = ref(walletStore.groups[0].id)
const wallets = computed(() => walletStore.wallets.filter(item => item.group == selectedGroup.value))

const importAddress = ref('')

onMounted(() => {
   selectedGroup.value = walletStore.groups[0].id

})

function updateName(address: string) {
    const name = newName.value
    editAddress.value = ''
    if (name.length == 0) {
        return
    }
    const index = wallets.value.findIndex(item => item.address == address)
    if (index < 0) {
        
        return
    }
    const item = wallets.value[index]
    item.name = name
    walletStore.update(item)
}


function deleteHandle(name: string, address: string) {
    dialog.warning({
        title: '删除地址确认',
        content: `是否删除 ${name} 地址\n${getAddress(address)}`,
        negativeText: '取消',
        positiveText: '确定',
        onPositiveClick: async () => {
            if(walletStore.remove(address)) {
                const index = wallets.value.findIndex(item => item.address == address)
                if (index >= 0) {
                    wallets.value.splice(index, 1)
                }
            }
            keyStore.removeSimplePrivateKey(address)
        },

    })
}



function removeKey(address: string) {
    try {

        keyStore.removeSimplePrivateKey(address)
    } catch(e: any) {
        message.error(e.message)
        return
    }
}

function closeImportModal() {
    showImportModal.value = false
    importAddress.value = ''
}

function importHandle(address: string) {
    importAddress.value = address
    showImportModal.value = true
}

</script>

<template>
    <n-card>
        <n-space vertical>
            <n-modal v-model:show="showModal">
                <AddSimpleWallet @close="showModal=false" />
            </n-modal>
            <n-modal v-model:show="showImportModal" @after-leave="closeImportModal">
                <ImportSimpleWallet @close="closeImportModal" :address="importAddress" />
            </n-modal>
            <n-space>
                <n-button @click="showModal=true" round type="primary">Add Address</n-button>
                <n-button @click="importHandle('')" round type="primary">Import By Private Key</n-button>
            </n-space>
            <n-space align="center">
                <h2>Group</h2>
                <n-select v-model:value="selectedGroup" :options="groupList" size="small" placeholder="select group" style="width: 200px" />
            </n-space>
            <n-table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Key</th>
                        <th>Option</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item of wallets">
                        <td>
                            <n-space v-if="editAddress != item.address">
                                <div>{{ item.name }}</div>
                                <n-button text style="font-size:24px" @click="editAddress=item.address">
                                    <n-icon><Pencil/></n-icon>
                                </n-button>
                            </n-space>
                            <n-space v-else>
                                <n-input v-model:value="newName" />
                                <n-button text style="font-size:24px" @click="updateName(item.address)">
                                    <n-icon><CheckmarkCircle/></n-icon>
                                </n-button>
                            </n-space>
                        </td>
                        <!-- <td>{{ item.address }}</td> -->
                        <td>{{ getAddress(item.address) }}</td>
                        <td>
                            <n-tag v-if="keyList.includes(item.address)" type="success" round>Imported</n-tag>
                            <n-tag v-else type="warning" round>Unknow</n-tag>
                        </td>
                        <td>
                            <n-space>
                                <n-button v-if="keyList.includes(item.address)" type="warning" @click="removeKey(item.address)" round>Remove Key</n-button>
                                <n-button v-else type="info" @click="importHandle(item.address)" round>Import Key</n-button>
                                <n-button type="error" @click="deleteHandle(item.name, item.address)" round>Delete</n-button>
                            </n-space>
                        </td>
                    </tr>
                </tbody>
            </n-table>
        </n-space>
    </n-card>
</template>