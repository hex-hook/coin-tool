import { useChainStore } from "@/stores/chain";
import { computed } from "vue";

export function useTokens() {
    const chainState = useChainStore();
    return computed(() => {
        return chainState.tokens.filter(item => item.chainId == chainState.activeChainId);
    });
}

export function useTokenOptions() {
    const chainState = useChainStore();
    return computed(() => {
        const tokens = chainState.tokens.filter(item => item.chainId == chainState.activeChainId).map(item => {
            return { label: item.symbol, value: item.address };
        });
        const network = chainState.networks.find(item => item.chainId == chainState.activeChainId);
        if (!network) {
            return tokens
        }
        return [...tokens, { label: network.nativeCurrency, value: "0x" }]
    });
}

export function useContracts() {
    const chainState = useChainStore();
    return computed(() => {
        return chainState.contracts.filter(item => item.chainId == chainState.activeChainId);
    });
}

export function useContractOptions() {
    const chainState = useChainStore();
    return computed(() => {
        return chainState.contracts.filter(item => item.chainId == chainState.activeChainId).map(item => {
            return { label: item.description, value: item.address };
        });
    });
}

export function useNetworks() {
    const chainState = useChainStore();
    return computed(() => {
        return chainState.networks;
    });
}

export function useNetworkOptions() {
    const chainState = useChainStore();
    return computed(() => {
        return chainState.networks.map(item => {
            return { label: item.name, value: item.chainId };
        });
    });
}
