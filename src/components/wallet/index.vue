<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import Assets from '@/components/assets/index.vue'
import SimpleWallet from '@/components/simple-wallet/index.vue'
import TokenManage from '@/components/token/index.vue'
import SimpleGroupManage from '@/components/group-manage/index.vue'
import NetworkManage from '@/components/network/index.vue'
import HDWallet from '@/components/hd-wallet/index.vue'
import HDGroup from '@/components/hd-wallet-group/index.vue'

</script>

<template>
    <n-tabs type="card">
        <n-tab-pane tab="Assets" name="assets" display-directive="show">
            <Assets />
        </n-tab-pane>
        <n-tab-pane tab="HD Wallet" name="hdWallet" display-directive="show">
            <HDWallet />
        </n-tab-pane>
        <n-tab-pane tab="Simple Wallet" name="Simple Wallet" display-directive="show">
            <SimpleWallet />
        </n-tab-pane>
        <n-tab-pane tab="HD Group" name="hd group" display-directive="show">
            <HDGroup />
        </n-tab-pane>
        <n-tab-pane tab="Group" name="group" display-directive="show">
            <SimpleGroupManage />
        </n-tab-pane>
        <n-tab-pane tab="Token" name="token" display-directive="show">
            <TokenManage />
        </n-tab-pane>
        <n-tab-pane tab="Network" name="network" display-directive="show">
            <NetworkManage />
        </n-tab-pane>
    </n-tabs>
</template>