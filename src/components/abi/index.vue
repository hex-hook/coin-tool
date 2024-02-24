<script setup lang="ts">
import { NAnchor, NAnchorLink, NSpace, NInput, NButton, NCard, useMessage, NLayout, NLayoutContent, NLayoutHeader, NLayoutSider, NSwitch, NIcon } from 'naive-ui'
import { ref, watch } from 'vue';
import Caller from './caller.vue'
import { useChainStore } from '@/stores/chain';
import { JsonFragment, ethers, FunctionFragment } from 'ethers'
import { AddCircle } from '@vicons/ionicons5'
import { useProvider } from '@/hooks/provider';


const message = useMessage()
const chainStore = useChainStore()

const isHumanReadableABI = ref(true)
const humanABI = ref('')
const abiText = ref('')
const contractAbi = ref<JsonFragment[] | FunctionFragment[]>([])

const contractAddress = ref<string>('')
const description = ref('')

watch(contractAddress, (v) => {
    if (v.length == 0) {
        return
    }
    useProvider().value.getCode(contractAddress.value).then((code) => {
        if (code == '0x') {
            message.error('address is not contract')
        }
    })
})

function resolveAbi() {
    contractAbi.value = []
    const data = abiText.value
    if (data.length == 0) {
        message.error('contract abi json is empty')
        return
    }
    try {
        const abiJson = JSON.parse(data)
        if (!Array.isArray(abiJson)) {
            message.error('json data is not array')
            return
        }
        contractAbi.value = abiJson.filter((item => item.type == 'function')) as JsonFragment[]

    } catch (e: any) {
        message.error(e.message)
    }
}

function saveContract() {
    if (contractAddress.value.length == 0) {
        message.error(`contract address is failed`)
        return
    }
    chainStore.saveContract({
        address: contractAddress.value,
        description: description.value,
        chainId: chainStore.activeChainId,
        abi: contractAbi.value
    })
}

function addFunction() {
    if (humanABI.value.length == 0) {
        message.error('function is empty')
        return
    }
    try {
        const fragments = new ethers.Interface([humanABI.value]).fragments
        if (fragments.length == 0) {
            message.error('function is empty')
            return
        }
        const abiFunction = fragments[0] as FunctionFragment
        contractAbi.value.push(abiFunction)
        humanABI.value = ''
    } catch (e: any) {
        console.log(e)
        message.error(e.message)
    }

}

</script>


<template>
    <n-layout has-sider>
        <n-layout-sider>
            <n-anchor v-if="contractAbi.length > 0" type="block" style="z-index: 1; border:1px solid var(--n-border-color); border-radius: 3px; padding:10px;max-width: 250px;" :top="250" affix>
                <n-anchor-link v-for="fc of contractAbi" :title="fc.name" :href="`#contract-function-${fc.name}`" :key="'abi-'+fc.name"/>
            </n-anchor>
        </n-layout-sider>
        <n-layout>
            <n-layout-header style="padding: 5px">
                <n-card>
                    <n-space vertical>
                        <n-space align="center">
                            <div style="width: 150px">Contract Address</div>
                            <n-input v-model:value="contractAddress" :style="{ width: '500px' }" />
                        </n-space>
                        <n-space v-if="contractAbi.length > 0">
                            <div style="width: 150px;">Description</div>
                            <n-input v-model:value="description" :style="{ width: '500px' }"/>
                        </n-space>
                        <n-space>
                            <n-switch v-model:value="isHumanReadableABI"/>
                            <div>Human-Readable ABI</div>
                        </n-space>
                        <n-space vertical v-if="isHumanReadableABI">
                            <n-space align="center">
                                <n-input placeholder="function transferFrom(address,address,uint256)" v-model:value="humanABI" style="width:400px"/>
                                <n-button type="info" text @click="addFunction">
                                    <n-icon><AddCircle /></n-icon>
                                </n-button>
                            </n-space>
                        </n-space>
                        <n-input v-else type="textarea" placeholder="contract abi (json)" v-model:value="abiText"
                            :autosize="{ minRows: 5, maxRows: 10 }" />
                        <n-space justify="center">
                            <n-button @click="resolveAbi" type="info" round>Resolve</n-button>
                            <n-button :disabled="contractAbi.length == 0" @click="saveContract" type="primary" round>Save</n-button>
                        </n-space>
                    </n-space>
                </n-card>
            </n-layout-header>
            <n-layout-content>
               
                    <caller v-for="fc of contractAbi" :data="fc" :address="contractAddress" :id="`contract-function-${fc.name}`" :key="'abi-caller-' + fc.name" />
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>