<script setup lang="ts">
import { NIcon, useMessage, useDialog, NCard, NTable, NSpace, NButton, NInput } from 'naive-ui'
import { useChainStore } from '@/stores/chain'
import { ref } from 'vue';
import { Pencil, CheckmarkCircle } from '@vicons/ionicons5'
import Caller from '@/components/abi/caller.vue'
import type { JsonFragment } from 'ethers'
import { useContracts } from '@/hooks/chain'


const chainStore = useChainStore()
const message = useMessage()
const dialog = useDialog()

const contractList = useContracts()
const editDescription = ref('')
const editAddress = ref('')

const selectedAddress = ref('')
const contractAbi = ref<JsonFragment[]>([])


function deleteHandle(address: string, chainId: string) {
    dialog.error({
        title: '删除组确认',
        content: `是否删除 ${address}`,
        negativeText: '取消',
        positiveText: '确定',
        onPositiveClick: () => {
            if (chainStore.deleteContract(address, chainId)) {
                message.success('delete contract success')
            }

        }
    })
}

function saveDescription(address: string, chainId: string) {
    const description = editDescription.value
    editDescription.value = ''
    editAddress.value = ''
    const data = contractList.value.find(item => item.address == address && item.chainId == chainId)
    if (!data) {
        return
    }
    data.description = description
    chainStore.saveContract(data)
}

function callHandle(address: string, chainId: string) {
    contractAbi.value = []
    selectedAddress.value = address
    const item = contractList.value.find(item => item.address == address && item.chainId == chainId)
    if (item) {
        contractAbi.value = item.abi
    }
}

function clearCaller() {
    selectedAddress.value = ''
    contractAbi.value = []
}
</script>



<template>
    <n-card>

        <n-table>
            <thead>
                <tr>
                    <th>Address</th>
                    <th>Description</th>
                    <th>Option</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item of contractList">
                    <td>{{ item.address }}</td>
                    <td>
                        <n-space v-if="editAddress != item.address">
                                <div>{{ item.description }}</div>
                                <n-button text style="font-size:24px" @click="editAddress=item.address">
                                    <n-icon><Pencil/></n-icon>
                                </n-button>
                            </n-space>
                            <n-space v-else>
                                <n-input v-model:value="editDescription" />
                                <n-button text style="font-size:24px" @click="saveDescription(item.address, item.chainId)">
                                    <n-icon><CheckmarkCircle/></n-icon>
                                </n-button>
                            </n-space>
                    </td>
                    <td>
                        <n-space>
                            <n-button type="primary" round @click="callHandle(item.address, item.chainId)">Call</n-button>
                            <n-button type="error" round @click="deleteHandle(item.address, item.chainId)">Delete</n-button>
                            <n-button v-if="selectedAddress==item.address" type="info" round @click="clearCaller">Hidden</n-button>
                        </n-space>
                    </td>
                </tr>
            </tbody>
        </n-table>

        <caller v-for="item of contractAbi" :data="item" :address="selectedAddress" />
    </n-card>
</template>