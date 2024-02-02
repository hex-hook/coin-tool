<script setup lang="ts">
import { NCard, NSelect, NSpace, NButton } from 'naive-ui'

import { useWalletStore } from '@/stores/wallet';
import { useContractStore } from '@/stores/contract';
import { computed, ref } from 'vue';
import ContractCall from '@/components/abi/caller.vue'

const walletStore = useWalletStore();
const contractStore = useContractStore();

const networkOptions = computed(() => {
    return walletStore.networks.map((network) => {
        return {
            label: network.name,
            value: network.chainId
        }
    })
})

const selectedNetwork = ref('')

const contractOptions = computed(() => {
    return contractStore.contracts.filter(item => item.chainId == selectedNetwork.value).map((contract) => {
        return {
            label: contract.description,
            value: contract.address
        }
    })
})

const selectedContract = ref('')

const abiFunctionOptions = computed(() => {
    return contractStore.contracts.find(item => item.chainId == selectedNetwork.value && item.address == selectedContract.value)?.abi.map((fc) => {
        return {
            label: fc.name,
            value: fc.name
        }
    })
})

const selectedFunction = ref('')
const abiFunction = computed(() => {
    return contractStore.contracts.find(item => item.chainId == selectedNetwork.value && item.address == selectedContract.value)?.abi.find(item => item.name == selectedFunction.value)
})

const invokeParams = ref<any[]>([])
const payValue = ref(0)


function updateParams(params: string[]) {
    invokeParams.value = params
}

function updatePayValue(value: number) {
    payValue.value = value
}



</script>

<template>
    <n-card style="width:600px">
        <n-space vertical>
            <h4>Network</h4>
            <n-select :options="networkOptions" v-model:value="selectedNetwork"/>
            <h4>Contract</h4>
            <n-select :options="contractOptions" v-model:value="selectedContract" />
            <h4>Function</h4>
            <n-select :options="abiFunctionOptions" v-model:value="selectedFunction" />
            <ContractCall v-if="abiFunction" :address="selectedContract" :data="abiFunction" @updateParams="updateParams" @updatePayValue="updatePayValue" />
            <n-space>
                <n-button>Add</n-button>
            </n-space>
        </n-space>

    </n-card>
</template>