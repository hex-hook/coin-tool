import { ethers, Wallet, HDNodeWallet } from "ethers";
import { defineStore } from "pinia";

interface HDWallet {
    name: string
    first: string
    // ['0x...']
    accounts: string[]
}

interface WalletInfo {
    name?: string
    jsonData: string
}

interface KeyStore {
    key: string
    // 基于助记词的钱包
    hdWallet: HDWallet[]
    // 基于私钥的钱包
    simpleAccounts: string[]
    isLock: boolean
    isCreated: boolean
}

// 基于 password 生成的 key，用于作为真实的钱包存储密码
// const DEFAULT_PBKDF2_ITERATIONS = 100000;

const _key = 'key_v0'

function isCreatedKeyring() {
    return localStorage.getItem(_key) != null

}

/**
 * 从持久化存储中加载钱包信息
 * {'0x...': {name: 'wallet-0', jsonData: '...'}, '0x...': {jsonData: '...'}}
 * @returns Record<string, WalletInfo> key 为第一个地址，value 为钱包信息
 */
function loadEncryptedWallets(): Record<string, WalletInfo> {
    const dataString = localStorage.getItem(_key)
    if (dataString) {
        return JSON.parse(dataString) as Record<string, WalletInfo>
    }
    return {};
}

function loadEncryptedWalletByAddress(address: string, password: string): Wallet | HDNodeWallet {
    const wallet = loadEncryptedWallets()[address]
    if (!wallet) {
        throw new Error(`not found wallet by address: ${address}`);
    }
    return ethers.Wallet.fromEncryptedJsonSync(wallet.jsonData, password)
}

function saveEncryptedWallets(data: Record<string, WalletInfo>) {
    localStorage.setItem(_key, JSON.stringify(data));
}

export const useKeyStore = defineStore('keystore', {
    state: (): KeyStore => {
        return {
            key: '',
            hdWallet: [],
            simpleAccounts: [],
            isLock: true,
            isCreated: isCreatedKeyring()
        }
    },
    actions: {
        createHDWallet(name: string, count = 10, mnemonic?: string) {
            if (!mnemonic) {
                mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(32));
            }
            const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
            const lastWallet = hdWallet.deriveChild(count);
            const addressList: string[] = [hdWallet.address]
            for (let i = 1; i < count; i++) {
                addressList.push(hdWallet.deriveChild(i).address)
            }
            const encryptedJson = lastWallet.encryptSync(this.key);
            saveEncryptedWallets({ ...loadEncryptedWallets(), [hdWallet.address]: { name, jsonData: encryptedJson } })
            this.hdWallet.push({ name, accounts: addressList, first: hdWallet.address });
            return mnemonic
        },
        initWallet(password: string) {
            this.key = password
            this.createHDWallet('wallet-0')
            this.isCreated = true
            this.isLock = false
        },
        refreshState(item: WalletInfo) {
            const wallet = ethers.Wallet.fromEncryptedJsonSync(item.jsonData, this.key)
            if (wallet instanceof ethers.HDNodeWallet) {
                const accounts: string[] = []
                const root = ethers.HDNodeWallet.fromPhrase(wallet.mnemonic?.phrase as string)
                for (let i = 0; i < wallet.index; i++) {
                    accounts.push(root.deriveChild(i).address)
                }
                this.hdWallet.push({ name: item.name || 'unset', accounts, first: accounts[0] })
            } else if (wallet instanceof ethers.Wallet) {
                this.simpleAccounts.push(wallet.address)
            } else {
                console.error('unknown wallet type', wallet)
            }

        },
        verify(password: string) {
            const wallets = loadEncryptedWallets();

            try {
                for (const key in wallets) {
                    this.refreshState(wallets[key]);
                }
            } catch (e) {
                console.error(e)
                return false
            }

            this.isLock = false
            this.key = password
            return true
        },
        exportPrivate(address: string) {
            if (this.simpleAccounts.includes(address)) {
                return this.exportSimplePrivate(address)
            } else {
                return this.exportHDPrivate(address)
            }
        },
        exportSimplePrivate(address: string) {
            return loadEncryptedWalletByAddress(address, this.key).privateKey
        },
        exportHDPrivate(address: string) {
            const firstWallet = this.hdWallet.find(item => item.accounts.includes(address))
            if (!firstWallet) {
                throw new Error(`not found wallet by ${address}`);
            }
            const wallet = loadEncryptedWalletByAddress(firstWallet.first, this.key) as HDNodeWallet
           
            const childWallet = wallet.deriveChild(firstWallet.accounts.indexOf(address))
            console.log(`childWallet address: ${childWallet.address}, address: ${address}`)
            return childWallet.privateKey
        },
        batchExportPrivate(addresses: string[]): Record<string, string> {
            const res: Record<string, string> = {}
            const wallets = loadEncryptedWallets();
            for (const address of addresses) {
                let wallet
                if (this.simpleAccounts.includes(address)) {
                    wallet = wallets[address]
                    const simpleWallet = ethers.Wallet.fromEncryptedJsonSync(wallet.jsonData, this.key)
                    res[address] = simpleWallet.privateKey
                } else {
                    const firstWallet = this.hdWallet.find(item => item.accounts.includes(address))
                    if (!firstWallet) {
                        throw new Error(`not found wallet: ${address}`);
                    }
                    wallet = wallets[firstWallet.first]
                    let hdWallet = ethers.Wallet.fromEncryptedJsonSync(wallet.jsonData, this.key) as ethers.HDNodeWallet
                    const index = firstWallet.accounts.indexOf(address);
                    const hdRoot = ethers.HDNodeWallet.fromPhrase(hdWallet.mnemonic?.phrase as string)
                    if (index > 0) {
                        hdWallet = hdRoot.deriveChild(index)
                    }
                    res[address] = hdWallet.privateKey
                }
            }
            return res

        },
        importPrivateKey(privateKey: string) {
            const wallet = new ethers.Wallet(privateKey)
            this.simpleAccounts.push(wallet.address)
            saveEncryptedWallets({ ...loadEncryptedWallets(), [wallet.address]: { jsonData: wallet.encryptSync(this.key) } })
            return wallet.address
        },
        addAccounts(address: string, count = 10) {
            const wallets = loadEncryptedWallets();
            const wallet = wallets[address]
            if (!wallet) {
                throw new Error(`not found HD wallet: ${address}`);
            }
            const hdWallet = ethers.Wallet.fromEncryptedJsonSync(wallet.jsonData, this.key) as ethers.HDNodeWallet
            const lastIndex = hdWallet.index + count
            const lastWallet = hdWallet.deriveChild(lastIndex);
            const hdRoot = ethers.HDNodeWallet.fromPhrase(hdWallet.mnemonic?.phrase as string)
            const addressList: string[] = []
            for (let i = hdWallet.index; i < lastIndex; i++) {
                addressList.push(hdRoot.deriveChild(i).address)
            }
            saveEncryptedWallets({ ...wallets, [address]: { jsonData: lastWallet.encryptSync(this.key), name: wallet.name } })
            const index = this.hdWallet.findIndex(item => item.first === address)
            const oldWallet = this.hdWallet[index]
            oldWallet.accounts.push(...addressList)
            this.hdWallet.splice(index, 1, oldWallet);
        },
        removeSimplePrivateKey(address: string) {
            const wallets = loadEncryptedWallets();
            const wallet = wallets[address]
            if (!wallet) {
                throw new Error(`not found HD wallet: ${address}`);
            }
            delete wallets[address]
            this.simpleAccounts.splice(this.simpleAccounts.indexOf(address), 1)
            saveEncryptedWallets(wallets)
        },
        removeHDWallet(address: string) {
            const wallets = loadEncryptedWallets();
            const wallet = wallets[address]
            if (!wallet) {
                throw new Error(`not found HD wallet: ${address}`);
            }
            delete wallets[address]
            saveEncryptedWallets(wallets)
            this.hdWallet.splice(this.hdWallet.findIndex(item => item.first === address), 1)
        },
        clearKey() {
            this.key = ''
            this.isLock = true
        },
    }
})