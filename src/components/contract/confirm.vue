<script setup lang="ts">
import { NSpace, NTag } from 'naive-ui'
import { TransactionLike } from 'ethers';

interface Props {
    tx: TransactionLike
    network: Wallet.Network
    method: string
}

const props = defineProps<Props>()
</script>

<template>
    <n-space vertical>
        <h3>Network</h3>
        <n-tag :type="network.isTest ? 'info': 'warning'">{{ network.name }}</n-tag>
        <h4>Method</h4>
        <n-tag type="info">{{ props.method }}</n-tag>
        <h4>From</h4>
        <n-tag type="info">{{ props.tx.from }}</n-tag>
        <h4>To</h4>
        <n-tag type="primary">{{ props.tx.to }}</n-tag>
        <h4>Value</h4>
        <n-tag type="error">{{ props.tx.value }}</n-tag>
        <h4>Gas Price</h4>
        <n-tag type="warning">{{ props.tx.gasPrice }}</n-tag>
        
    </n-space>
</template>