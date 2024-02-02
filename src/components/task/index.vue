<script setup lang="ts">
import { NCard, NTable, NSpace, NButton, NModal } from 'naive-ui'
import { ref } from 'vue';
import Creator from './creator.vue'

const taskList = ref<Task.Task[]>([
    {
        name: 'test',
        description: 'test',
        id: 1,
    },
    {
        name: 'test',
        description: 'test',
        id: 2,
    },
])

const showModal = ref(false)



</script>
<template>
    <n-card>
        <n-modal v-model:show="showModal" @after-leave="showModal=false">
            <Creator />
        </n-modal>
        <n-space>
            <n-button @click="showModal=true">Create</n-button>
        </n-space>
        <n-table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Options</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="task of taskList">
                    <td>{{ task.name }}</td>
                    <td>{{ task.description }}</td>
                    <td>
                        <n-space>
                            <n-button>View</n-button>
                            <n-button>Delete</n-button>
                        </n-space>
                    </td>
                </tr>
            </tbody>
        </n-table>
    </n-card>
</template>