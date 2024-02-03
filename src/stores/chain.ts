import { defineStore } from "pinia";
import { DEFAULT_NETWORKS } from '@/assets/network'

interface ChainState {
    tokens: Chain.Token[],
    contracts: Chain.Contract[],
    transactions: Chain.Transactions[]
    networks: Chain.Network[]
    activeChainId: string
}

const _key = 'chain_v0'
function loadStore(): ChainState {
    const dataString = localStorage.getItem(_key)
    if (dataString) {
        return JSON.parse(dataString) as ChainState
    }
    return {
        // tokens: [{name: 'bnb', symbol: 'bnb', decimals: 18, address: '0', chainId: 'bsc'}],
        tokens: [],
        contracts: [],
        transactions: [],
        networks: [],
        activeChainId: DEFAULT_NETWORKS[0].chainId
    }
}

function saveStore(data: ChainState) {
    localStorage.setItem(_key, JSON.stringify(data))
}

export const useChainStore = defineStore('contracts', {
    state: (): ChainState => {
        return loadStore()
    },
    getters: {
        getTokenByChainId: (state) => (chainId: string) => {
            return state.tokens.filter(item =>item.chainId == chainId)
        }
        ,
    },
    actions: {
        addToken(item: Chain.Token) {
            const index = this.tokens.findIndex(o => o.address == item.address && o.chainId == item.address)
            if (index >= 0) {
                console.warn(`${item.address} is already exist`)
                return false
            }
            this.tokens.push(item)
            this.record()
            return true
        },
        updateToken(item: Chain.Token) {
            const index = this.tokens.findIndex(o => o.address == item.address && o.chainId == item.address)
            if (index >= 0) {
                this.tokens.splice(index, 1, item)
            } else {
                this.tokens.push(item)
            }
            this.record()
        },
        remove(address: string, chainId: string) {
            const index = this.tokens.findIndex(item => item.address == address && item.chainId == chainId)
            if (index < 0) {
                console.error(`not found wallet [${address}] at [${chainId}]`)
                return false
            }
            this.tokens.splice(index, 1)
            this.record()
            return true
        },
        saveContract(item: Chain.Contract) {
            const index = this.contracts.findIndex(o => o.address == item.address && o.chainId == item.chainId)
            if (index >= 0) {
                this.contracts.splice(index, 1, item)
            } else {
                this.contracts.push(item)
            }
            this.record()
        },
        deleteContract(address: string, chainId: string) {
            const index = this.contracts.findIndex(item => item.address == address && item.chainId == chainId)
            if (index < 0) {
                console.error(`not found contract [${address}] at [${chainId}]`)
                return false
            }
            this.contracts.splice(index, 1)
            this.record()
            return true
        },
        addTransaction(item: Chain.Transactions) {
            const index = this.transactions.findIndex(o => o.tx == item.tx && o.chainId == item.chainId)
            if (index >= 0) {
                this.transactions.splice(index, 1, item)
            } else {
                this.transactions.push(item)
            }
            this.record()
        },
        updateActiveNetwork(chainId: string) {
            const index = this.networks.findIndex(o => o.chainId == chainId);
            if (index >= 0) {
                this.activeChainId = chainId
                this.record()
            }
        },
        addNetwork(item: Chain.Network) {
            const index = this.networks.findIndex(o => o.chainId == item.chainId)
            if (index >= 0) {
                console.warn(`${item.chainId} is already exist`)
                return false
            }
            this.networks.push(item)
            this.record()
            return true
        },
        updateNetwork(item: Chain.Network) {
            const index = this.networks.findIndex(o => o.chainId == item.chainId)
            if (index >= 0) {
                this.networks.splice(index, 1, item)
            } else {
                this.networks.push(item)
            }
            this.record()
        },
        deleteNetwork(chainId: string) {
            const index = this.networks.findIndex(o => o.chainId == chainId)
            if (index < 0) {
                console.error(`not found network [${chainId}]`)
                return false
            }
            this.networks.splice(index, 1)
            this.record()
            return true
        },
        record() {
            saveStore(this.$state)
        }
    }
})