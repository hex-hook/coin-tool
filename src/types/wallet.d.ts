declare namespace Wallet {
    interface Address {
        name: string
        address: string
        hasPrivateKey: boolean
        group: number
        createdAt: number
    }
    
    interface Group {
        id: number
        name: string
        description: string
    }

    interface Network {
        chainId: string
        // 主站
        domain: string
        subdomain: string
        // 全称
        name: string
        // 原生货币
        nativeCurrency: string
        rpcUrl: string
        // 区块链浏览器地址
        blockExplorerUrl: string
        imageUrl: string
        isTest: boolean
    }

}