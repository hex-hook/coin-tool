import type { JsonFragment } from 'ethers'


declare namespace Chain {
    interface Token {
        address: string
        name: string
        symbol: string
        decimals: number
        chainId: string
    }

    interface Contract {
        address: string
        chainId: string
        description: string
        abi: JsonFragment[]
    }

    interface Transactions {
        chainId: string
        symbol: string
        method: string
        contractAddress?: string
        tx: string
        from: string
        to: string
        count: string
        createdAt: number
    }
}