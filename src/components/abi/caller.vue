<script setup lang="ts">
import { NSpace, NCard, NInput, NButton, NSwitch, NTag, NTable, useMessage, NInputNumber, useDialog, NIcon } from 'naive-ui'
import { onMounted, ref, h, watch } from 'vue';
import AccountSelector from '@/components/ui/account-selector.vue'
import { useKeyStore } from '@/stores/key';
import ContractConfirm from '@/components/contract/confirm.vue'
import { ChevronDownCircleOutline, ChevronUpCircleOutline } from '@vicons/ionicons5'
import { JsonFragment, TransactionLike, ethers, FunctionFragment } from 'ethers'
import { useProvider } from '@/hooks/provider';
import { useChainStore } from '@/stores/chain';

interface Props {
    data: JsonFragment | FunctionFragment
    address: string
}

interface Emits {
    (e: 'updateParams', params: string[]): void
    (e: 'updatePayValue', value: number): void
}


const _state_dict: Record<string, 'success' | 'info' | 'warning'> = {
    'view': 'success',
    'pure': 'info',
    'nonpayable': 'info',
    'payable': 'warning'
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialog = useDialog()
const message = useMessage()
const keyStore = useKeyStore()
const chainStore = useChainStore()

const values = ref<string[]>([])
const response = ref('')
const selectedAddress = ref('')
const payValue = ref(0)
const showParams = ref(false)

onMounted(() => {
    if (!props.data.inputs) return
    values.value = props.data.inputs.map(item => item.type == 'bool' ? 'false' : '')
})

function getStateTag(): 'info' | 'success' | 'warning' {
    if (props.data.stateMutability) {

        return _state_dict[props.data.stateMutability]
    } else {
        return 'info'
    }
}

async function sendContract() {
    if (props.address.length == 0) {
        message.error('address is failed')
        return
    }
    if (selectedAddress.value.length == 0) {
        message.error('wallet is empty')
        return
    }

    if (props.data.stateMutability == 'payable') {
        if (payValue.value == 0) {
            message.error('pay value is 0')
            return
        }
    }
    const from = selectedAddress.value
    const to = props.address
    const chainId = chainStore.activeChainId
    const network = chainStore.networks.find(item => item.chainId == chainId)
    if (!network) {
        message.error('network is failed')
        return
    }
    
    const value = ethers.formatEther(BigInt(payValue.value))
    const tx: TransactionLike = {
        from,
        to,
        // gasPrice,
        value
    }
    dialog.warning({
        title: '调用智能合约',
        content: () => h(ContractConfirm, { tx, network, method: props.data.name }),
        negativeText: '取消',
        positiveText: '确定',
        onPositiveClick: async () => {
            const priKey = keyStore.exportPrivate(selectedAddress.value)
            const wallet = new ethers.Wallet(priKey, useProvider().value)
            const contract = new ethers.Contract(props.address, [props.data], wallet)
            const args = values.value
            if (props.data.inputs) {
                const len = props.data.inputs.length || 0
                for (let i = 0; i < len; i++) {
                    const item = props.data.inputs[i]
                    if (item.type == 'bytes32') {
                        args[i] = ethers.encodeBytes32String(args[i])
                    }
                }
            }
            const res = await contract[`${props.data.name}`](...args)
            await res.wait()
        
        }
    })

}

function jsonStringify(data: any) {
  return JSON.stringify(data, (_,v) => {
    if (typeof v === 'bigint') {
      return v.toString()
    }
    return v
  })
}

async function callContract() {
    if (props.address.length == 0) {
        message.error('address is failed')
        return
    }
    try {
        const contract = new ethers.Contract(props.address, [props.data], useProvider().value)
        const args = values.value
        const value = await contract[`${props.data.name}`](...args)
        if (typeof value == 'object') {
            response.value = `${jsonStringify(value)}`
        } else {
            response.value = `${value}`
        }
    } catch (err: any) {
        message.error(err.message)
    }

}

function updateAddress(address: string | string[]) {
    selectedAddress.value = address as string
}

watch(values, () => {
    emit('updateParams', values.value)
})

watch(payValue, () => {
    emit('updatePayValue', payValue.value)
})

</script>

<template>
    <div>
        <n-card :style="{ margin: '10px' }">
            <template #header>
                <n-space align="center">
                    <div>{{ props.data.name }}</div>
                    <n-tag :type="getStateTag()" round>{{ props.data.stateMutability }}</n-tag>
                    <n-button text style="font-size:24px" @click="showParams=!showParams">
                        <n-icon>
                            <ChevronUpCircleOutline v-if="showParams"/>
                            <ChevronDownCircleOutline v-else/>
                        </n-icon>
                    </n-button>
                </n-space>
            </template>
            <n-space vertical v-show="showParams">


                <n-table v-if="props.data.inputs">
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>type</th>
                            <th>value</th>
                        </tr>

                    </thead>
                    <tbody>
                        <tr v-for="(param, index) of props.data.inputs" :key="'input-' + index">
                            <td>{{ param.name }}</td>
                            <td>{{ param.type }}</td>
                            <td>
                                <n-switch v-model:value="values[index]" v-if="param.type == 'bool'">
                                    <template #checked>true</template>
                                    <template #unchecked>false</template>
                                </n-switch>
                                <template v-else>
                                    <n-input v-model:value="values[index]" />

                                </template>
                            </td>
                        </tr>
                    </tbody>
                </n-table>
                <!-- <div v-else>not found param by abi</div> -->
                <n-space v-if="props.data.stateMutability == 'payable'" align="center">
                    <AccountSelector :multiple="false" :filter-private="true" @update-value="updateAddress" />
                    <n-tag type="error" round>Pay</n-tag>
                    <n-input-number v-if="props.data.stateMutability == 'payable'" v-model:value="payValue" />
                    <n-button @click="sendContract" type="error" round>Send</n-button>
                </n-space>
                <n-space v-else-if="props.data.stateMutability == 'nonpayable'" align="center">
                    <AccountSelector :multiple="false" :filter-private="true" @update-value="updateAddress" />
                    <n-button @click="sendContract" type="warning" round>Sign</n-button>
                </n-space>
                <n-button v-else type="success" @click="callContract" round>Call</n-button>
                <n-card v-if="response">
                    {{ response }}
                </n-card>
            </n-space>


        </n-card>
    </div>
</template>