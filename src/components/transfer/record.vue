<script setup lang="ts">
import { NCard, NTag, NTable } from 'naive-ui'
import { useChainStore } from '@/stores/chain';
import { computed } from 'vue';
import { getAddress } from 'ethers';

const chainStore = useChainStore()

const transferList = computed(() => chainStore.transactions.filter(item => item.chainId == chainStore.activeChainId))
const network = computed(() => chainStore.networks.find(item => item.chainId == chainStore.activeChainId))

</script>
<template>
    <n-card v-if="transferList.length > 0">
        <n-table>
            <thead>
                <tr>
                    <th>TX</th>
                    <th>Method</th>
                    <th>DateTime</th>
                    <th>From</th>
                    <th>To</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item of transferList">
                    <td>
                        <a v-if="network" :href="`${network.blockExplorerUrl}/tx/${item.tx}`" target="_blank">{{ item.tx }}</a>
                        <a v-else>{{ item.tx }}</a>
                    </td>
                    <td><n-tag>{{ item.method }}</n-tag></td>
                    <td>{{ new Date(item.createdAt).toLocaleString() }}</td>
                    <td> 
                        <a v-if="network" :href="`${network.blockExplorerUrl}/address/${item.from}`" target="_blank">{{ getAddress(item.from) }}</a>
                        <a v-else>{{ item.from }}</a>
                    </td>
                    <td>
                        <a v-if="network" :href="`${network.blockExplorerUrl}/address/${item.to}`" target="_blank">{{ item.to }}</a>
                        <a v-else>{{ item.to }}</a>
                        
                    </td>
                </tr>
            </tbody>
        </n-table>
    </n-card>
</template>