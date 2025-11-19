<template>
    <v-dialog v-model="show" max-width="90vw" fullscreen-on-mobile>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center pa-4">
                <div>
                    <div class="text-h6 font-weight-bold">{{ detailTitle }}</div>
                    <div class="text-caption text-grey">{{ detailData.length }} items</div>
                </div>
                <v-btn icon @click="$emit('close')" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-0">
                <!-- Mobile List View -->
                <div class="d-block d-md-none">
                    <MobileDetailView :detail-type="detailType" :detail-data="detailData"
                        @show-region-accounts="$emit('show-region-accounts', $event)"
                        @show-image="$emit('show-image', $event)" />
                </div>

                <!-- Desktop Table View -->
                <div class="d-none d-md-block">
                    <DesktopDetailView :detail-type="detailType" :detail-data="detailData" :is-loading="isLoading"
                        @show-region-accounts="$emit('show-region-accounts', $event)" />
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import MobileDetailView from './detail/MobileDetailView.vue'
import DesktopDetailView from './detail/DesktopDetailView.vue'

export default {
    name: 'DetailModal',
    components: {
        MobileDetailView,
        DesktopDetailView
    },
    props: {
        show: Boolean,
        detailType: String,
        detailTitle: String,
        detailData: Array,
        isLoading: Boolean
    },
    emits: ['close', 'show-region-accounts', 'show-image']
}
</script>