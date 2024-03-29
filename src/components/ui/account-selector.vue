<script setup lang="ts">
// a tree select component with wallet account
// - select wallet or group
// support select one or more

import { NTreeSelect,  } from 'naive-ui'
import { useKeyStore } from '@/stores/key'
import { useWalletStore } from '@/stores/wallet'
import { computed, ref, watch } from 'vue';
import type { TreeSelectOption } from 'naive-ui'

interface Props {
    multiple: boolean
    filterPrivate: boolean
    filterAddress?: string | string[]
}

interface Emits {
    (e: 'updateValue', addressList: string | string[]) : void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const keyStore = useKeyStore()
const walletStore = useWalletStore()

const selectedWallets = ref<string| string[]>(props.multiple ? [] : '')


const accountsOptions = computed(() => {
    const filterAddress = props.filterAddress || []
    const simpleWallet = {
        label: 'Simple Wallet',
        key: 'simple-wallet',
        children: walletStore.groups.filter(item => !item.address).map(item => ({
            label: item.name,
            key: item.id,
            children: walletStore.wallets.filter(o => o.group == item.id).map(account => ({
                label: `${account.name}(${account.address})`,
                key: account.address,
                disabled: (props.filterPrivate && !keyStore.simpleAccounts.includes(account.address)) || filterAddress.includes(account.address)
            }))
        }))
    }
    const hdAccountNameDict = walletStore.wallets.filter(o => o.group == 0).reduce((pre, cur) => {
        pre[cur.address] = cur.name
        return pre
    }, {} as Record<string, string>)
    if (keyStore.hdAccounts.length == 0) {
        return [simpleWallet] as TreeSelectOption[]
    }
    const hdWallet = {
        label: 'HD Wallet',
        key: 'hd-wallet',
        children: walletStore.groups.filter(item => item.address).map(item => ({
            label: item.name,
            key: 'group-' + item.address,
            children: keyStore.hdAccounts.find(wallets => wallets.includes(item.address as string))?.map(account => ({
                label: `${hdAccountNameDict[account]??''}(${account})`,
                key: account,
                disabled: filterAddress.includes(account)
            })) || []
        }))
    }
    return [ hdWallet, simpleWallet] as TreeSelectOption[]
})

watch(selectedWallets, () => {
    emit('updateValue', selectedWallets.value)
})
</script>

<template>
    <n-tree-select
        v-model:value="selectedWallets"
        :multiple="props.multiple"
        :options="accountsOptions"
        placeholder="Select Wallet"
        check-strategy="child"
        clearable
        checkable
        cascade
        size="small"
        style="width: 500px"
    />
</template>