<template>
  <v-card class="mt-2 black-gold-card">
    <v-toolbar flat class="mb-1 text-center black-gold-toolbar" density="compact">
      <v-toolbar-title class="toolbar-title"> {{ title }} </v-toolbar-title>
    </v-toolbar>
    <v-card-title class="black-gold-search-section">
      <slot name="search" />
    </v-card-title>
    <div class="black-gold-datatable-wrapper">
      <slot name="datatable" />
    </div>
  </v-card>
</template>

<script>
export default {
  props: {
    title: String,
  },
};
</script>

<style scoped>
/* Main Card Styling */
.black-gold-card {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.15) !important;
  overflow: hidden !important;
}

/* Toolbar Header Styling */



.toolbar-title {
  letter-spacing: 3px !important;
  font-weight: bold !important;
  color: #000000 !important;
  font-size: 30px !important;
  text-transform: uppercase !important;
  /* text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8) !important; */
  position: relative !important;
  z-index: 1 !important;
}

/* DataTable Wrapper */
.black-gold-datatable-wrapper {
  background: transparent !important;
  padding: 0 !important;
}

/* Deep styling for nested components */
/* :deep(.v-toolbar-title) {
  color: #000000 !important;
} */


.black-gold-card :deep(.v-toolbar) {
  background: #9b9b9b;
  color: #FFD700 !important;
}

.black-gold-card :deep(.v-toolbar .v-toolbar-title) {
  color: #ffffff !important;
}

/* Hover effects */
.black-gold-card:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
  box-shadow: 0 12px 40px rgba(255, 215, 0, 0.25) !important;
}

.black-gold-toolbar:hover .toolbar-title {
  text-shadow: 2px 2px 8px rgba(255, 215, 0, 0.6) !important;
  transition: all 0.3s ease !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .toolbar-title {
    font-size: 16px !important;
    letter-spacing: 2px !important;
  }

  .black-gold-search-section {
    padding: 12px 16px !important;
  }
}

/* Animation for loading state */
.black-gold-card.loading {
  position: relative;
}

.black-gold-card.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 215, 0, 0.2),
      transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

/* Additional elegant touches */
.black-gold-toolbar {
  background-attachment: fixed !important;
}

.toolbar-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  /* background: linear-gradient(90deg, transparent, #FFD700, transparent); */
  border-radius: 2px;
}
</style>