declare namespace Task {
    interface Task {
        id: number
        name: string
        description: string
    }

    interface ContractCall {
        chainId: number
        contractAddress: string
        functionName: string
        functionArgs: any[]
        addressList: string[]
    }

}