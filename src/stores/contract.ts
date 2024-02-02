import { defineStore } from "pinia";

interface ContractState {
    tokens: Chain.Token[],
    contracts: Chain.Contract[],
    transactions: Chain.Transactions[]
}

const _key = 'contract_v0'
function loadStore(): ContractState {
    const dataString = localStorage.getItem(_key)
    if (dataString) {
        return JSON.parse(dataString) as ContractState
    }
    return {
        // tokens: [{name: 'bnb', symbol: 'bnb', decimals: 18, address: '0', chainId: 'bsc'}],
        tokens: [],
        contracts: [],
        transactions: [],
    }
}

function saveStore(data: ContractState) {
    localStorage.setItem(_key, JSON.stringify(data))
}

export const useContractStore = defineStore('contracts', {
    state: (): ContractState => {
        return loadStore()
    },
    getters: {
        getTokenByChainId: (state) => (chainId: string) => {
            return state.tokens.filter(item =>item.chainId == chainId)
        }
        ,
    },
    actions: {
        add(item: Chain.Token) {
            const index = this.tokens.findIndex(o => o.address == item.address && o.chainId == item.address)
            if (index >= 0) {
                console.warn(`${item.address} is arealy exist`)
                return false
            }
            this.tokens.push(item)
            this.record()
            return true
        },
        udpate(item: Chain.Token) {
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
        record() {
            saveStore(this.$state)
        }
    }
})