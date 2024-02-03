<script setup lang="ts">
import { NSpace, useMessage, NCard, NTable, NButton, NModal } from 'naive-ui'
import { computed, ref } from 'vue';
import { useChainStore } from '@/stores/chain'
import Add from './add.vue'

const _chainIdList = ['0x38', '0x1', '0x61', '0x5', '0xaa36a7']

const message = useMessage()
const chainStore = useChainStore()
const showModal = ref(false)

const networks = computed(() => chainStore.networks)

function deleteHandle(chainId: string) {
    if (_chainIdList.includes(chainId)) {
        message.error(`chain [${chainId}] can not delete`)
        return
    }
    chainStore.deleteNetwork(chainId)
}


</script>

<template>
    <n-card>
        <n-modal v-model:show="showModal">
            <Add @close="showModal= false" />
        </n-modal>
        <n-space vertical>
            <n-button type="primary" @click="showModal=true" round>Add</n-button>
        <n-table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Native Currency</th>
                    <th>Chain Id</th>
                    <th>Domain</th>
                    <th>RpcUrl</th>
                    <th>Block Explorer</th>
                    <th>Type</th>
                    <th>Option</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item of networks">
                    <td>{{ item.name }}</td>
                    <td>{{ item.nativeCurrency }}</td>
                    <td>{{ item.chainId }}</td>
                    <td>{{ item.domain }}</td>
                    <td>{{ item.rpcUrl }}</td>
                    <td>{{ item.blockExplorerUrl }}</td>
                    <td>{{ item.isTest ? 'Test': 'Main' }}</td>
                    <td>
                        <n-button v-if="!_chainIdList.includes(item.chainId)" type="error" round @click="deleteHandle(item.chainId)">Delete</n-button>
                    </td>
                </tr>
            </tbody>
        </n-table>
        </n-space>
        
    </n-card>
</template>