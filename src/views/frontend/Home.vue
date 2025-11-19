<template>
    <FMain>
        <template #main-content>
            <v-container>
                <h1>Home Page</h1>
                <p>Welcome to the home page.</p>
            </v-container>
        </template>
    </FMain>
</template>

<script>
import FMain from '@/components/layouts/frontend/FMain'
export default {
    components: {
        FMain,
    },
};
</script>