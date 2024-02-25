<script setup lang="ts">
import { NInput, NCard, NSpace, NButton, NTable, NInputNumber, NSelect, NIcon } from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue';
import { useKeyStore } from '@/stores/key';
import { useWalletStore } from '@/stores/wallet';
import { Close, Pencil, Save } from '@vicons/ionicons5';
import { getAddress } from 'ethers';
import { useChainStore } from '@/stores/chain';

const keyStore = useKeyStore();
const walletStore = useWalletStore();
const chainStore = useChainStore();



const walletSelectOptions = computed(() => walletStore.groups
    .filter(item => item.address)
    .map(item => ({ label: item.name, value: item.address }))
)

const count = ref(1)


const selectedWallet = ref('')
const accounts = ref<string[]>([])

const addressInfoList = ref<Wallet.Address[]>([])
const editNameAddress = ref('')
const editName = ref('')

onMounted(() => {
    if (walletSelectOptions.value.length > 0) {
        selectedWallet.value = walletSelectOptions.value[0].value as string
        updateWallet()
    }
})

function updateWallet() {
    accounts.value = []
    const newAccounts = keyStore.hdAccounts.find(item => item.includes(selectedWallet.value))
    if (newAccounts) {
        accounts.value = newAccounts
        initAddressInfoList()
    }
}

function initAddressInfoList() {
    addressInfoList.value = []
    const newAddressInfoList = walletStore.wallets.filter(item => accounts.value.includes(item.address))
    if (newAddressInfoList) {
        addressInfoList.value = newAddressInfoList
    }
}

watch(selectedWallet, () => {
    updateWallet()
})

function addAccounts() {
    keyStore.addAccounts(selectedWallet.value, count.value)
    updateWallet()
    count.value = 1
}


// get name by address
function getNameByAddress(address: string) {
    const addressInfo = addressInfoList.value.find(item => item.address == address)
    if (addressInfo) {
        return addressInfo.name
    }
    return ''
}

// save address name
function saveName() {
    if (editNameAddress.value.length == 0) {
        throw new Error('address is empty')
    }
    if (editName.value.length == 0) {
        throw new Error('name is empty')
    }
    const item = {
        address: editNameAddress.value,
        name: editName.value,
        group: 0,
        createdAt: Date.now(),
        hasPrivateKey: true,
    }
    walletStore.update(item)
    const index = addressInfoList.value.findIndex(item => item.address == editNameAddress.value)

    if (index < 0) {
        addressInfoList.value.push(item)
    } else {
        addressInfoList.value.splice(index, 1, item)
    }
    editNameAddress.value = ''
    editName.value = ''
}
</script>

<template>
    <n-card>
        <n-space vertical>

            
            <n-space align="center">
                <h2>Wallet</h2>
                <n-select :options="walletSelectOptions" v-model:value="selectedWallet" :style="{width: '200px'}"/>
                <n-input-number v-model:value="count" :min="1" :max="50" />
                <n-button @click="addAccounts" round type="primary">Add Account</n-button>
            </n-space>

            <n-table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Option</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item of accounts">
                        <td>
                            <n-space v-if="editNameAddress == item">
                                <n-input v-model:value="editName" />
                                <n-button text style="font-size: 24px;" @click="saveName"><n-icon>
                                        <Save />
                                    </n-icon></n-button>
                                <n-button text style="font-size: 24px;" @click="editNameAddress = ''"><n-icon>
                                        <Close />
                                    </n-icon></n-button>
                            </n-space>
                            <n-space v-else>
                                <span>{{ getNameByAddress(item) }}</span>
                                <n-button text style="font-size: 24px;" @click="editNameAddress = item"><n-icon>
                                        <Pencil />
                                    </n-icon></n-button>
                            </n-space>
                        </td>
                        <td>{{ getAddress(item) }}</td>
                        <td><n-button round type="info">-</n-button></td>
                    </tr>
            </tbody>
        </n-table>
    </n-space>
</n-card></template>