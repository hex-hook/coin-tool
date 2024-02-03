import { defineStore } from "pinia";

interface WalletState {
    // simple wallet and hd wallet, but hd wallet group is 0
    wallets: Wallet.Address[]
    groups: Wallet.Group[]
}

const _key = 'wallet_v0.2'

function getDefault(): WalletState {
    return {
        wallets: [],
        groups: [{
            id: 1,
            name: 'default',
            description: ''
        }],
    }
}
function loadStore(): WalletState {
    const dataString = localStorage.getItem(_key)
    const defaultData = getDefault()
    if (!dataString) {
        return defaultData
    }
    const data = JSON.parse(dataString) as WalletState
    return {...defaultData, ...data}
    
}

function saveStore(data: WalletState) {
    localStorage.setItem(_key, JSON.stringify(data))
}

export const useWalletStore = defineStore('wallets', {
    state: (): WalletState => {
        return loadStore()
    },
    actions: {
        add(item: Wallet.Address) {
            const index = this.wallets.findIndex(o => o.address == item.address)
            if (index >= 0) {
                console.warn(`${item.address} is already exist`)
                return false
            }
            this.wallets.push(item)
            this.record()
            return true
        },
        update(item: Wallet.Address) {
            const index = this.wallets.findIndex(o => o.address == item.address)
            if (index >= 0) {
                this.wallets.splice(index, 1, item)
            } else {
                this.wallets.push(item)
            }
            this.record()
        },
        remove(address: string) {
            const index = this.wallets.findIndex(item => item.address == address)
            if (index < 0) {
                console.error(`not found wallet [${address}]`)
                return false
            }
            this.wallets.splice(index, 1)
            this.record()
            return true
        },
        addGroup(item: Wallet.Group) {
            const index = this.groups.findIndex(o => o.id == item.id)
            if (index >= 0) {
                console.warn(`${item} is already exist`)
                return false
            }
            this.groups.push(item)
            this.record()
            return true
        },
        updateGroup(item: Wallet.Group) {
            const index = this.groups.findIndex(o => o.id == item.id)
            if (index >= 0) {
                this.groups.splice(index, 1, item)
            } else {
                this.groups.push(item)
            }
            this.record()
        },
        deleteGroup(id: number): boolean {
            const index = this.groups.findIndex(o => o.id == id)
            if (index < 0) {
                console.error(`not found group [${id}]`)
                return false
            }
            const list = this.wallets.filter(item => item.group == id)
            if (list.length > 0) {
                console.error(`this group has [${list.length}] wallet`)
                return false
            }
            this.groups.splice(index, 1)
            this.record()
            return true
        },
        record() {
            saveStore(this.$state)
        }
    }
})