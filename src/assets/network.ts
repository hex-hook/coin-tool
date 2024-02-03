export const DEFAULT_NETWORKS: Chain.Network[] = [
    {
        chainId: '0x38',
        domain: 'bscscan.com',
        subdomain: 'api',
        name: 'Binance Smart Chain',
        nativeCurrency: 'BNB',
        rpcUrl: 'https://rpc.ankr.com/bsc',
        blockExplorerUrl: 'https://bscscan.com',
        imageUrl: '',
        isTest: false,
    },
    {
        chainId: '0x1',
        domain: 'etherscan.io',
        subdomain: 'api',
        name: 'Ethereum Mainnet',
        nativeCurrency: 'ETH',
        rpcUrl: 'https://rpc.ankr.com/eth',
        blockExplorerUrl: 'https://etherscan.io',
        imageUrl: '',
        isTest: false
    },
    {
        chainId: '0x61',
        domain: 'bscscan.com',
        subdomain: 'api-testnet',
        name: 'BNB Smart Chain Testnet',
        nativeCurrency: 'tBNB',
        rpcUrl: 'https://rpc.ankr.com/bsc_testnet_chapel',
        blockExplorerUrl: 'https://testnet.bscscan.com',
        imageUrl: '',
        isTest: true
    },
    {
        chainId: '0x5',
        domain: 'etherscan.io',
        subdomain: 'api-goerli',
        name: 'Goerli',
        nativeCurrency: 'GoerliETH',
        rpcUrl: 'https://rpc.ankr.com/eth_goerli',
        blockExplorerUrl: 'https://goerli.etherscan.io',
        imageUrl: '',
        isTest: true
    },
    {
        chainId: '0xaa36a7',
        domain: 'etherscan.io',
        subdomain: 'api-sepolia',
        name: 'Sepolia',
        nativeCurrency: 'SepoliaETH',
        rpcUrl: 'https://rpc.ankr.com/eth_sepolia',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
        imageUrl: '',
        isTest: true
    },
]