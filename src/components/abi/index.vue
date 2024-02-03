<script setup lang="ts">
import { NAnchor, NAnchorLink, NSpace, NInput, NButton, NCard, useMessage, NLayout, NLayoutContent, NLayoutHeader, NLayoutSider } from 'naive-ui'
import { ref } from 'vue';
import Caller from './caller.vue'
import { useChainStore } from '@/stores/chain';
import type { JsonFragment } from 'ethers'

const message = useMessage()
const chainStore = useChainStore()


const abiText = ref('')
const contractAbi = ref<JsonFragment[]>([])

const contractAddress = ref<string>('')
const description = ref('')


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

</script>


<template>
    <n-layout has-sider>
        <n-layout-sider>
            <n-anchor v-if="contractAbi.length > 0" type="block" style="z-index: 1; border:1px solid var(--n-border-color); border-radius: 3px; padding:10px;max-width: 250px;" :top="250" affix>
                <n-anchor-link v-for="fc of contractAbi" :title="fc.name" :href="`#contract-function-${fc.name}`" />
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
                        <n-input type="textarea" placeholder="contract abi (json)" v-model:value="abiText"
                            :autosize="{ minRows: 5, maxRows: 10 }" />
                        <n-space justify="center">
                            <n-button @click="resolveAbi" type="info" round>Resolve</n-button>
                            <n-button :disabled="contractAbi.length == 0" @click="saveContract" type="primary" round>Save</n-button>
                        </n-space>
                    </n-space>
                </n-card>
            </n-layout-header>
            <n-layout-content>
               
                    <caller v-for="fc of contractAbi" :data="fc" :address="contractAddress" :id="`contract-function-${fc.name}`"  />
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>