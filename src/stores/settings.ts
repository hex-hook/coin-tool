import { defineStore } from 'pinia';

interface SettingsState {
    provider: string
    endpoint: string
}

const _key = 'settings_v0.1'

function getDefault(): SettingsState {
    return {
        provider: 'https://rpc.ankr.com',
        endpoint: ''
    }
}

function loadStore() :SettingsState {
    const dataString = localStorage.getItem(_key)
    const defaultData = getDefault()
    if (!dataString) {
        return defaultData
    }
    const data = JSON.parse(dataString)
    return {...defaultData, ...data}
}

function saveStore(data: SettingsState) {
    localStorage.setItem(_key, JSON.stringify(data))
}

export const useSettingsStore = defineStore('settings', {
    state: (): SettingsState => {
        return loadStore()
    },
    actions: {
        update(data: Settings.Settings) {
            this.$state.endpoint = data.endpoint
            this.$state.provider = data.provider
        },
        record() {
            saveStore(this.$state)
        }

    }
})