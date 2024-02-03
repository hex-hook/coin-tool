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
        // hd 钱包第一个地址的
        address?: string
    }

}