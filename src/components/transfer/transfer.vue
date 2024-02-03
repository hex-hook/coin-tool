<script setup lang="ts">
import { ref, watch, h } from 'vue';
import { NCard, NSpace, NSwitch, NButton, NInputNumber, useMessage, useDialog, NSelect } from 'naive-ui'
import { useKeyStore } from '@/stores/key';
import AccountSelector from '@/components/ui/account-selector.vue'
import OrderConfirm from '@/components/ui/order-confirm.vue'
import { useERC20ByWallet, useProvider } from '@/hooks/provider';
import { ethers, TransactionRequest, Wallet } from 'ethers';
import { useTokenOptions } from '@/hooks/chain';
// wallet transfer to wallet by web3
// - input wallet address
// - input token count
// - input target wallet address
// - send
const keyStore = useKeyStore()
const message = useMessage()
const dialog = useDialog()
const provider = useProvider()

const tokenCount = ref(0)

// const txHash = ref('')

const isOneToMore = ref(true)
const selectedSourceWallet = ref<string | string[]>('')
const selectedTargetWallet = ref<string | string[]>([])
const tokenAddress = ref('0x')
const tokenOptions = useTokenOptions()


// send token
async function send(from: string, to: string, count: number, wallet: Wallet, nonce?: number) {


    // send eth
    // - set tx
    // - sign tx and send
    // - show tx hash
    const tx: TransactionRequest = {
        from,
        to,
        value: ethers.parseUnits(count.toString(), 'ether'),
        nonce,
    }
    const gas = await provider.value.estimateGas(tx)
    // get gas price by ethers
    const { gasPrice } = await provider.value.getFeeData()
    const receipt = await wallet.sendTransaction({
        ...tx,
        gasPrice: gasPrice,
        gasLimit: gas.toString()
    })
    await receipt.wait()
    // message.success(`tx hash: ${hash}`)
    //         txHash.value = hash
    //         const chainId = walletStore.activeNetwork
    //         const network = walletStore.networks.find(item => item.chainId == chainId)
    //         const item = {
    //             chainId,
    //             tx: hash,
    //             symbol: network?.nativeCurrency || 'ETH',
    //             from,
    //             to,
    //             createdAt: Date.now(),
    //             count: count.toString(),
    //             method: 'transfer',
    //         }
    // contractStore.addTransaction(item)

}

async function sendToken(from: string, to: string, count: number, wallet: Wallet, nonce?: number) {
    const contract = useERC20ByWallet(tokenAddress.value, wallet)
    const tokenAmount = ethers.parseEther(count.toString())
    console.log(`from: ${from} to: ${to} count: ${count} tokenAmount: ${tokenAmount}`)
    const tx = await contract.transfer(to, tokenAmount, { nonce })
    await tx.await()

    // const chainId = walletStore.activeNetwork
    //         const network = walletStore.networks.find(item => item.chainId == chainId)
    //         const item = {
    //             chainId,
    //             tx: hash,
    //             symbol: network?.nativeCurrency || 'ETH',
    //             from,
    //             to,
    //             createdAt: Date.now(),
    //             count: count.toString(),
    //             method: 'transfer',
    //             contractAddress: tokenAddress.value
    //         }
    //         contractStore.addTransaction(item)
}

async function sendOneToMore() {
    const source = selectedSourceWallet.value as string
    const target = selectedTargetWallet.value as string[]
    const key = await keyStore.exportPrivate(source)
    const wallet = new ethers.Wallet('0x' + key, provider.value)
    const nonce = await provider.value.getTransactionCount(source);
    const isERC20 = tokenAddress.value != '0x'
    for (let i = 0; i < target.length; i++) {
        if (isERC20) {
            await sendToken(source, target[i], tokenCount.value, wallet, nonce + i)
        } else {
            await send(source, target[i], tokenCount.value, wallet, nonce + i)
        }
    }

}

async function sendMoreToOne() {
    const source = selectedSourceWallet.value as string[]
    const target = selectedTargetWallet.value as string
    const keyDict = await keyStore.batchExportPrivate(source)
    const isERC20 = tokenAddress.value != '0x'
    for (const address in keyDict) {
        const wallet = new ethers.Wallet('0x' + keyDict[address], provider.value)
        if (isERC20) {
            await sendToken(address, target, tokenCount.value, wallet)
        } else {
            await send(address, target, tokenCount.value, wallet)
        }
    }
}

// check send params
// - token address
// - token count
// - source address
// - target address
// source don't contain target address, and target don't contain source address
function checkParams() {
    if (tokenAddress.value.length == 0) {
        message.error('token address is invalid')
        return false
    }
    if (tokenCount.value <= 0) {
        message.error('token count is invalid')
        return false
    }
    if (selectedSourceWallet.value.length == 0) {
        message.error('source address is invalid')
        return false
    }
    if (selectedTargetWallet.value.length == 0) {
        message.error('target address is invalid')
        return false
    }
    if (isOneToMore.value) {
        const from = selectedSourceWallet.value as string
        const to = selectedTargetWallet.value as string[]
        if (to.includes(from)) {
            message.error('source address is invalid')
            return false
        }
    } else {
        const from = selectedSourceWallet.value as string[]
        const to = selectedTargetWallet.value as string
        if (from.includes(to)) {
            message.error('target address is invalid')
            return false
        }
    }
    return true
}

async function sendAll() {
    if (!checkParams()) {
        return
    }

    dialog.warning({
        title: '确认发送',
        // content: `从${selectedSourceWallet.value} 发送到 ${selectedTargetWallet.value} \n 数量: ${tokenCount.value} \n 总共: ${orderCount} 个交易，${tokenCount.value * orderCount} 个代币`,
        content: () => {
            return h(OrderConfirm, {
                from: selectedSourceWallet.value,
                to: selectedTargetWallet.value,
                count: tokenCount.value,
                symbol: tokenOptions.value.find(item => item.value == tokenAddress.value)?.label || 'Unknow',
            })
        },
        negativeText: '取消',
        positiveText: '确定',
        onPositiveClick: async () => {
            if (isOneToMore.value) {
                await sendOneToMore()
            } else {
                await sendMoreToOne()
            }
        }
    })
}


watch(isOneToMore, () => {
    if (isOneToMore.value) {
        selectedSourceWallet.value = ''
        selectedTargetWallet.value = []
    } else {
        selectedTargetWallet.value = []
        selectedSourceWallet.value = ''
    }
})

function updateSourceWallet(address: string | string[]) {
    selectedSourceWallet.value = address
}

function updateTargetWallet(address: string | string[]) {
    selectedTargetWallet.value = address
}
</script>

<template>
    <n-card>
        <n-space vertical>
            <n-space>
                <h3>{{ isOneToMore ? 'One To More' : 'More To One' }}</h3>
                <n-switch v-model:value="isOneToMore" />
            </n-space>
            <n-space>
                <AccountSelector :multiple="!isOneToMore" :filter-private="isOneToMore" @update-value="updateSourceWallet"/>
                <n-space vertical>
                    <n-select :options="tokenOptions" v-model:value="tokenAddress" />
                    <n-input-number v-model:value="tokenCount" />
                    <n-space justify="center">
                        <n-button round type="primary" @click="sendAll">Send</n-button>
                    </n-space>
                </n-space>
                <AccountSelector :multiple="isOneToMore" :filter-private="!isOneToMore" @update-value="updateTargetWallet"/>
            </n-space>
        </n-space>
    </n-card>
</template>