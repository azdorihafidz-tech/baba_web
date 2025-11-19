<template>
    <v-snackbar tit location="bottom center">
        {{ text }}
    </v-snackbar>
</template>

<script>
export default {
    props: {
        text: String,
    },
};
</script>