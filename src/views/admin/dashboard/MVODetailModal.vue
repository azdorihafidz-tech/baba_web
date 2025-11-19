<template>
    <v-dialog v-model="show" max-width="90vw" fullscreen-on-mobile>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center pa-4">
                <div>
                    <div class="text-h6 font-weight-bold">Akun Detail</div>
                    <div class="text-caption text-grey">ID: {{ mvoId }}</div>
                </div>
                <v-btn icon @click="$emit('close')" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-4">
                <v-row v-if="mvoData" class="mb-4">
                    <v-col cols="12" sm="4">
                        <v-card color="primary" dark elevation="2">
                            <v-card-text class="text-center pa-4">
                                <v-icon size="40" class="mb-2">mdi-star</v-icon>
                                <div class="text-h4">{{ mvoData.total_bintang || mvoData.total_stars || 0 }}</div>
                                <div class="text-subtitle-2">Total Bintang</div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <v-card class="mb-4" v-if="mvoData?.mvo">
                    <v-card-title class="pa-3">
                        <v-icon left>mdi-account</v-icon>
                        Informasi MVO
                    </v-card-title>
                    <v-card-text class="pa-3">
                        <v-row>
                            <v-col cols="12" sm="6">
                                <div class="text-body-2 text-grey mb-1">Nama:</div>
                                <div class="text-body-1 font-weight-medium">{{ mvoData.mvo.nama || 'N/A' }}</div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <div class="text-body-2 text-grey mb-1">Code:</div>
                                <div class="text-body-1 font-weight-medium">{{ mvoData.mvo.code || 'N/A' }}</div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'MVODetailModal',
    props: {
        show: Boolean,
        mvoId: [String, Number],
        mvoData: Object
    },
    emits: ['close']
}
</script>