<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from './stores/user'
import AppHeader from '@/components/AppHeader.vue'

const userStore = useUserStore()
const isLoading = ref<boolean>(true)
onMounted(() => {
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      userStore.userId = user.uid
    } else {
      userStore.userId = ''
    }
    isLoading.value = false
  })
})
</script>

<template>
  <div class="app">
    <div class="container">
      <app-progress class="spinner" v-if="isLoading" />
      <div v-else>
        <AppHeader />
        <div class="content">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
