import { ethers, Wallet, HDNodeWallet } from "ethers";
import { defineStore } from "pinia";

interface KeyStore {
    key: string
    // hd 钱包地址组
    hdAccounts: string[][]
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
 * {'0x...': 'encrypt private key wallet json data', '0x1...': 'encrypt hd wallet json data'}
 * @returns Record<string, string> key 为第一个地址，value 为钱包信息
 */
function loadEncryptedWallets(): Record<string, string> {
    const dataString = localStorage.getItem(_key)
    if (dataString) {
        return JSON.parse(dataString) as Record<string, string>
    }
    return {};
}

function loadEncryptedWalletByAddress(address: string, password: string): Wallet | HDNodeWallet {
    const jsonData = loadEncryptedWallets()[address]
    if (!jsonData) {
        throw new Error(`not found wallet by address: ${address}`);
    }
    return ethers.Wallet.fromEncryptedJsonSync(jsonData, password)
}

function saveEncryptedWallets(data: Record<string, string>) {
    localStorage.setItem(_key, JSON.stringify(data));
}

export const useKeyStore = defineStore('keystore', {
    state: (): KeyStore => {
        return {
            key: '',
            hdAccounts: [],
            simpleAccounts: [],
            isLock: true,
            isCreated: isCreatedKeyring()
        }
    },
    actions: {
        createHDWallet(count = 10, mnemonic?: string) {
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
            saveEncryptedWallets({ ...loadEncryptedWallets(), [hdWallet.address]: encryptedJson })
            this.hdAccounts.push(addressList)
            return [mnemonic, hdWallet.address]
        },
        initWallet(password: string) {
            this.key = password
            this.isCreated = true
            
            return this.createHDWallet()
        },
        refreshState(jsonData: string) {
            const wallet = ethers.Wallet.fromEncryptedJsonSync(jsonData, this.key)
            if (wallet instanceof ethers.HDNodeWallet) {
                const accounts: string[] = []
                const root = ethers.HDNodeWallet.fromPhrase(wallet.mnemonic?.phrase as string)
                for (let i = 0; i < wallet.index; i++) {
                    accounts.push(root.deriveChild(i).address)
                }
                this.hdAccounts.push(accounts)
            } else if (wallet instanceof ethers.Wallet) {
                this.simpleAccounts.push(wallet.address)
            } else {
                console.error('unknown wallet type', wallet)
            }

        },
        verify(password: string) {
            const wallets = loadEncryptedWallets();
            this.key = password

            try {
                for (const key in wallets) {
                    this.refreshState(wallets[key]);
                }
            } catch (e) {
                console.error(e)
                return false
            }

            this.isLock = false
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
            const accounts = this.hdAccounts.find(item => item.includes(address))
            if (!accounts || accounts.length === 0) {
                throw new Error(`not found wallet by ${address}`);
            }
            const wallet = loadEncryptedWalletByAddress(accounts[0], this.key) as HDNodeWallet
           
            const childWallet = wallet.deriveChild(accounts.indexOf(address))
            console.log(`childWallet address: ${childWallet.address}, address: ${address}`)
            return childWallet.privateKey
        },
        batchExportPrivate(addresses: string[]): Record<string, string> {
            const res: Record<string, string> = {}
            const wallets = loadEncryptedWallets();
            for (const address of addresses) {
                if (this.simpleAccounts.includes(address)) {
                    const wallet = wallets[address]
                    const simpleWallet = ethers.Wallet.fromEncryptedJsonSync(wallet, this.key)
                    res[address] = simpleWallet.privateKey
                } else {
                    const accounts = this.hdAccounts.find(item => item.includes(address))
                    if (!accounts || accounts.length === 0) {
                        throw new Error(`not found wallet: ${address}`);
                    }
                
                    const hdWallet = ethers.Wallet.fromEncryptedJsonSync(accounts[0], this.key) as ethers.HDNodeWallet
                    const index = accounts.indexOf(address);
                    const hdRoot = ethers.HDNodeWallet.fromPhrase(hdWallet.mnemonic?.phrase as string)
                    if (index > 0) {
                        res[address] = hdRoot.deriveChild(index).privateKey
                    }
                    
                }
            }
            return res

        },
        importPrivateKey(privateKey: string) {
            const wallet = new ethers.Wallet(privateKey)
            this.simpleAccounts.push(wallet.address)
            saveEncryptedWallets({ ...loadEncryptedWallets(), [wallet.address]: wallet.encryptSync(this.key) })
            return wallet.address
        },
        addAccounts(address: string, count = 10) {
            const wallets = loadEncryptedWallets();
            const wallet = wallets[address]
            if (!wallet) {
                throw new Error(`not found HD wallet: ${address}`);
            }
            const hdWallet = ethers.Wallet.fromEncryptedJsonSync(wallet, this.key) as ethers.HDNodeWallet
            const rootWallet = ethers.HDNodeWallet.fromPhrase(hdWallet.mnemonic?.phrase as string)
            const lastIndex = hdWallet.index + count
            const lastWallet = rootWallet.deriveChild(lastIndex);
            const addressList: string[] = []
            for (let i = hdWallet.index; i < lastIndex; i++) {
                addressList.push(rootWallet.deriveChild(i).address)
            }
            saveEncryptedWallets({ ...wallets, [address]: lastWallet.encryptSync(this.key) })
            const index = this.hdAccounts.findIndex(item => item.includes(address))
            const oldHdAccounts = this.hdAccounts[index]
            oldHdAccounts.push(...addressList)
            this.hdAccounts.splice(index, 1, oldHdAccounts);
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
            this.hdAccounts.splice(this.hdAccounts.findIndex(item => item.includes(address)), 1)
        },
        clearKey() {
            this.key = ''
            this.isLock = true
        },
    }
})