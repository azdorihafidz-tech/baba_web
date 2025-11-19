<template>
    <v-dialog v-model="show" max-width="90vw">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center pa-4">
                <span class="text-h6">Preview Image</span>
                <v-btn icon @click="$emit('close')" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="text-center pa-4">
                <v-img :src="imageUrl" max-height="70vh" contain class="rounded" :alt="'Document image'">
                    <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                    </template>
                    <template v-slot:error>
                        <div class="d-flex align-center justify-center fill-height text-grey">
                            <div class="text-center">
                                <v-icon size="64" class="mb-2">mdi-image-broken-variant</v-icon>
                                <div>Image could not be loaded</div>
                            </div>
                        </div>
                    </template>
                </v-img>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ImageModal',
    props: {
        show: Boolean,
        imageUrl: String
    },
    emits: ['close']
}
</script>