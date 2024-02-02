import { computed } from "vue";
import { useWalletStore } from "@/stores/wallet";
import { ethers, type JsonRpcProvider, type Wallet } from "ethers";
import { abiERC20 } from "@/assets/abis/ERC20";

// 通过存储的 network 获取当前网络的 provider
export function useProvider() {
    const walletStore = useWalletStore();
    return computed(() => {
        const network = walletStore.networks.find(item => item.chainId == walletStore.activeNetwork);
        return new ethers.JsonRpcProvider(network?.rpcUrl);
    });
}

/**
 * readonly ERC20 contract
 * @param address contract address
 * @param provider network provider
 * @returns 
 */
export function useERC20ByProvider(address: string, provider: JsonRpcProvider) {
    return new ethers.Contract(address, abiERC20, provider);
}

/**
 * signable ERC20 contract
 * @param address contract address
 * @param wallet contains the private key
 * @returns 
 */
export function useERC20ByWallet(address: string, wallet: Wallet) {
    return new ethers.Contract(address, abiERC20, wallet);
}