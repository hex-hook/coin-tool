<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import ABIIndex from '../abi/index.vue'
import Transfer from '../transfer/index.vue'
import Contract from '../contract/index.vue'
import Task from '../task/index.vue'

</script>

<template>
    <n-tabs type="card">
        <n-tab-pane tab="ABI" name="abi" display-directive="show">
            <ABIIndex />
        </n-tab-pane>
        <n-tab-pane tab="Contract" name="contact" display-directive="show">
            <Contract />
        </n-tab-pane>
        <n-tab-pane tab="Transfer" name="transfer" display-directive="show">
            <Transfer />
        </n-tab-pane>
        <n-tab-pane tab="Task" name="task" display-directive="show">
            <Task />
        </n-tab-pane>
    </n-tabs>
</template>