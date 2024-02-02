<script setup lang="ts">
import { NModal, NTable, NCard, NSpace, NButton, useDialog } from 'naive-ui'
import { ref } from 'vue';
import ImportToken from './import-token.vue'
import { useContractStore } from '@/stores/contract'
import { useWalletStore } from '@/stores/wallet';

const dialog = useDialog()

const tokenStore = useContractStore()
const walletStore = useWalletStore()

const tokenList = tokenStore.tokens
const showModal = ref(false)

function handleDelete(address: string, name: string) {
    dialog.warning({
        title: '删除地址确认',
        content: `是否删除代币 ${name} 地址\n${address}`,
        negativeText: '取消',
        positiveText: '确定',
        onPositiveClick: () => {
            tokenStore.remove(address, walletStore.activeNetwork)
        },
    })
  
}


</script>

<template>
    <n-card>
        <n-space vertical>
            <n-modal v-model:show="showModal">
                <import-token @import="showModal=false" />
            </n-modal>
            <n-button @click="showModal = true" type="primary" round>Add</n-button>
            <n-table>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Name</th>
                        <th>Symbol</th>
                        <th>Decimals</th>
                        <th>Option</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item of tokenList">
                        <td>{{ item.address }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.symbol }}</td>
                        <td>{{ item.decimals }}</td>
                        <td><n-button v-if="item.address != '0'" type="warning" @click="handleDelete(item.address, item.name)" >delete</n-button></td>
                    </tr>
                </tbody>
            </n-table>
        </n-space>
    </n-card>
</template>