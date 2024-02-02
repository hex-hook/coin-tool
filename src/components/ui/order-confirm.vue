<script setup lang="ts">
import { NSpace, NTag } from 'naive-ui'
import { onMounted, ref } from 'vue';

interface Props {
    from: string | string[]
    to: string | string[]
    count: number
    symbol: string
}

const props = defineProps<Props>()
const txCount = ref()

onMounted(() => {
    if (Array.isArray(props.from)) {
        txCount.value = props.from.length
    } else {
        txCount.value = props.to.length
    }
})

</script>
<template>
    <n-space vertical>
        <h4>Symbol</h4>
        <n-tag type="primary">{{ props.symbol }}</n-tag>
        <h4>From</h4>
        <n-tag type="info" v-if="Array.isArray(props.from)" v-for="item of props.from">{{ item }}</n-tag>
        <n-tag type="info" v-else>{{ props.from }}</n-tag>
        <h4>To</h4>
        <n-tag type="primary" v-if="Array.isArray(props.to)" v-for="item of props.to">{{ item }}</n-tag>
        <n-tag type="primary" v-else>{{ props.to }}</n-tag>
        <h4>TX Count</h4>
        <n-tag type="info">{{ txCount }}</n-tag>
        <h4>Total</h4>
        <n-space>
            <n-tag type="warning">{{ props.count }}</n-tag>*
            <n-tag type="warning">{{ txCount }}</n-tag>=
            <n-tag type="warning">{{ props.count * txCount }}</n-tag>
        </n-space>
    </n-space>
</template>