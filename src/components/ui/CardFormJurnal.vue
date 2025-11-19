<template>
    <v-card class="mt-2 mb-7">
        <v-toolbar flat :color="app.colors.grey" dark class="mb-1 text-center" density="compact">
            <v-toolbar-title class="toolbar-title"> {{ title }} </v-toolbar-title>
        </v-toolbar>
        <v-card-title>
            <slot name="form" />
        </v-card-title>
    </v-card>
</template>

<script>
import { useAppStore } from "@/stores/app.js";


export default {
    setup() {
        const app = useAppStore();

        return {
            app,
        };
    },
    props: {
        title: String,
    },
};
</script>

<style scoped>
.toolbar-title {
    letter-spacing: 3px;
    font-weight: bold;
    font-size: 14px;
}
</style>