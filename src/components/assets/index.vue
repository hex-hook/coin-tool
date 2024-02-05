<script setup lang="ts">
import TokenAssets from './token-assets.vue'
import { NCard, NSelect, NSpace, NCheckbox, NCheckboxGroup } from 'naive-ui'
import { useChainStore } from '@/stores/chain';
import { computed, onMounted, ref, watch } from 'vue';
import { useWalletStore } from '@/stores/wallet';

const walletStore = useWalletStore()
const chainStore = useChainStore()

// const addressList = ref<string[]>([])//['0xe7Bbc2A3D9381A159CdC2DE6e86Aa080E0D9345C','0x400e2a7444dEa936b98190785CCcAb200B85Bc9F', '0xe91AcA39972c1Be2432e8ab15aEB51a39D706210']

// 0 bnb, 1 ai, 2 doge
// const contractAddressList = ['0', '0xf2cd9944de065185e1ee867d74f66625b7a1cad6', '0xba2ae424d960c26247dd6c32edc70b295c744c43']

// erc20 token address
const contractAddressList = ref<Chain.Token[]>([])

const nativeCurrency = computed(() => {
    return chainStore.networks.filter(item => item.chainId == chainStore.activeChainId)
        .map(item => ({
            name: item.nativeCurrency,
            symbol: item.nativeCurrency,
            decimals: 18,
            // 默认为 0 时通过 getBalance 查询资产
            address: '0',
            chainId: item.chainId
        }))[0]
})

const activeChainId = computed(() => chainStore.activeChainId)
const groupOptions = computed(() => [
    {type: 'group', label: 'HD Wallet', children: walletStore.groups.filter(item => item.address).map(item => ({ label: item.name, value: `0-HD-${item.address}`}))},
    {type: 'group', label: 'Simple Wallet', children: walletStore.groups.filter(item => !item.address).map(item => ({ label: item.name, value: `${item.id}` }))}
])
const tokenOptions = computed(() => chainStore.tokens.filter(item => item.chainId == chainStore.activeChainId))
const selectedTokens = ref<string[]>([])
const selectedGroup = ref<string>()

function initTokens() {
    selectedTokens.value = []
    contractAddressList.value = []

}

onMounted(() => {
    initTokens()
})

watch(activeChainId, () => {
    initTokens()
})

watch(selectedTokens, () => {
    if (selectedTokens.value.length == 0) {
        contractAddressList.value = []
        return
    }
    const selectedList = selectedTokens.value
    // 删除已经不存在的
    const removed = contractAddressList.value.map((item, index) => selectedList.includes(item.address) ? -1 : index).filter(item => item != -1).reverse()
    for (const index of removed) {
        contractAddressList.value.splice(index, 1)
    }

    // 添加新增的
    const addressList = contractAddressList.value.map(item => item.address)
    const addList = selectedList.filter(item => !addressList.includes(item))
    const addTokenList = chainStore.tokens.filter(item => item.chainId == activeChainId.value && addList.includes(item.address))
    for (const item of addTokenList) {
        contractAddressList.value.push(item)
    }
})

watch(tokenOptions, () => {
    // 新增 token 时不受影响
    // 删除 token 时，对应选中的 token 要删除
    const existList = tokenOptions.value.map(item => item.address)
    const index = selectedTokens.value.findIndex(item => !existList.includes(item))
    if (index >= 0) {
        selectedTokens.value.splice(index, 1)
    }
    const index2 = contractAddressList.value.findIndex(item => !existList.includes(item.address))
    if (index2 >= 0) {
        contractAddressList.value.splice(index2, 1)
    }

})

</script>

<template>
    <n-space vertical>
        <n-card>
            <n-space align="center">
                <div>Group</div>
                <n-select :options="groupOptions" v-model:value="selectedGroup" :style="{ width: '300px' }" />
            </n-space>
            <n-checkbox-group v-model:value="selectedTokens">
                <n-checkbox v-for="item of tokenOptions" :value="item.address" :label="item.symbol" v-bind:key="item.address" />
            </n-checkbox-group>

        </n-card>
        <template v-if="selectedGroup">

            <TokenAssets v-if="nativeCurrency" :token="nativeCurrency" :group-id="selectedGroup" />
            <TokenAssets v-for="item of contractAddressList" :token="item" :group-id="selectedGroup" v-bind:key="item.address" />
        </template>
    </n-space>
</template>