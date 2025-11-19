<template>
    <v-card @click="handleClick">
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>{{ text }}</v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'CardDashboard',
    props: {
        title: {
            type: String,
            default: 'Default Title'
        },
        text: {
            type: [String, Number],
            default: ''
        }
    },
    methods: {
        handleClick() {
            this.$emit('card-click');
        }
    }
}
</script>

<style scoped>
/* Tambahkan styling di sini jika perlu */
</style>
