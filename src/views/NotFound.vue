<template>
  <div class="container">
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <v-card color="#f5f5f5" class="elevation-3">
            <v-card-title class="headline">404 - Not Found</v-card-title>
            <v-card-subtitle
              >The page you are looking for does not exist.</v-card-subtitle
            >
            <v-card-actions>
              <v-btn to="/admin/user">Go to Home</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: top;
  justify-content: center;
  height: 100vh;
  padding: 0 10px;
  background-color: #fff5e1;
}
</style>
