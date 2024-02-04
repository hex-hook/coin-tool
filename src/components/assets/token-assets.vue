<script setup lang="ts">
import { NTable, NCard, NSpace } from 'naive-ui';
import { onMounted, ref, watch } from 'vue';
import { useKeyStore } from '@/stores/key';
import { useWalletStore } from '@/stores/wallet';
import { useProvider, useERC20ByProvider } from '@/hooks/provider';
import { ethers, type Contract } from 'ethers';

interface Props {
    token: Chain.Token
    groupId: string
}

interface TableData {
    address: string
    count: string
    totalPrice: number
}

const walletStore = useWalletStore()
const keyStore = useKeyStore()

const provider = useProvider()



const props = defineProps<Props>()
const addressList = ref<string[]>([])
let contract: Contract

const data = ref<TableData[]>([])

// const price = ref(Math.random() * 1000)

const totalCount = ref<bigint>(BigInt(0))

const addressInfoList = ref<Wallet.Address[]>([])

async function initTokenBalance() {
    for (const address of addressList.value) {
        const count = await contract.balanceOf(address)
        const value = ethers.formatEther(count)
        console.log('count:', address, value)
        data.value.push({
            address,
            count: value,
            totalPrice: 0,
        })
    }
}

async function initBalance() {
    for (const address of addressList.value) {
        const count = await provider.value.getBalance(address)

        const value = ethers.formatEther(count)
        data.value.push({
            address,
            count: value,
            totalPrice: 0
        })
        totalCount.value += count
    }
}


function initData() {
    const groupId = props.groupId
    // start with 0-HD- is hd wallet
    if (groupId.startsWith('0-HD-')) {
        const address = groupId.split('-')[2]
        addressList.value = keyStore.hdAccounts.find(item => item.includes(address)) || []
    } else {
        addressList.value = walletStore.wallets.filter(item => item.group == parseInt(props.groupId)).map(item => item.address)
    }
    addressInfoList.value = walletStore.wallets.filter(item => addressList.value.includes(item.address))
    data.value = []

    if (props.token.address == '0') {
        initBalance()
    } else {
        contract = useERC20ByProvider(props.token.address, provider.value)
        initTokenBalance()
    }
}
// get name by address
function getNameByAddress(address: string) {
    const addressInfo = addressInfoList.value.find(item => item.address == address)
    if (addressInfo) {
        return addressInfo.name
    }
    return ''
}

onMounted(() => {
    // getTokenPrice()
    initData()
})



watch(props, () => {
    initData()
})

</script>

<template>
    <n-card :title="props.token.name" :style="{marginTop: '10px'}">
        <template #header>
            <n-space>
                <div style="font-size: large;">{{ props.token.symbol }}</div>
                <div>{{ totalCount }}</div>
                <div>$0</div>
            </n-space>
        </template>
        <n-table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Count</th>
                    <th>TotalPrice</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item of data">
                    <td>{{ getNameByAddress(item.address) }}</td>
                    <td>{{ item.address }}</td>
                    <td>{{ item.count }}</td>
                    <td>{{ item.totalPrice }}</td>
                </tr>
            </tbody>
        </n-table>

    </n-card>
</template>