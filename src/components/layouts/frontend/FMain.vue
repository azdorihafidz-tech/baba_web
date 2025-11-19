<template>
    <v-app id="inspire">
        <v-app-bar flat>
            <v-container class="mx-auto d-flex align-center justify-center">
                <v-avatar class="me-4 " color="grey-darken-1" size="32"></v-avatar>

                <v-btn v-for="link in links" :key="link.text" :to="link.route" variant="text">
                    {{ link.text }}
                </v-btn>

                <v-spacer></v-spacer>

                <v-responsive max-width="160">
                    <v-text-field label="Search" rounded="lg" flat hide-details single-line></v-text-field>
                </v-responsive>
            </v-container>
        </v-app-bar>

        <v-main class="bg-grey-lighten-3">
            <slot name="main-content"></slot>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'FMain',

    data() {
        return {
            links: [
                { text: 'Home', route: '/' },
                { text: 'Contact', route: '/contact' }
            ]
        };
    },
};
</script>