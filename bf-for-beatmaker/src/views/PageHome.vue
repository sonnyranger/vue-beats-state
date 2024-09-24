<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, setDoc, doc } from 'firebase/firestore'
import type { IInterview } from '@/interfaces'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const db = getFirestore()
const router = useRouter()

const artist = ref<string>('')
const publicLink = ref<string>('')
const managerName = ref<string>('')
const contactTelegram = ref<string>('')
const contactWhatsApp = ref<string>('')
const contactPhone = ref<string>('')

const loading = ref<boolean>(false)

const addNewInterview = async (): Promise<void> => {
  loading.value = true
  const payload: IInterview = {
    id: uuidv4(),
    artist: artist.value,
    publicLink: publicLink.value,
    managerName: managerName.value,
    contactTelegram: contactTelegram.value,
    contactWhatsApp: contactWhatsApp.value,
    contactPhone: contactPhone.value,
    createdAt: new Date()
  }

  if (userStore.userId) {
    await setDoc(doc(db, `users/${userStore.userId}/interviews`, payload.id), payload).then(() => {
      router.push('/list')
    })
  }
}

const disabledSaveButton = computed<boolean>(() => {
  return !(artist.value && publicLink.value && managerName.value)
})
</script>

<template>
  <div class="content-interview">
    <app-card>
      <template #title>Новая заявка</template>
      <template #content>
        <app-input-text class="input mb-3" placeholder="Артист" v-model="artist" />
        <app-input-text v-model="publicLink" class="input mb-3" placeholder="Ссылка на паблик ВК" />
        <app-input-text v-model="managerName" class="input mb-3" placeholder="Контакт (имя)" />
        <app-input-text v-model="contactTelegram" class="input mb-3" placeholder="Telegram" />
        <app-input-text v-model="contactWhatsApp" class="input mb-3" placeholder="WhatsApp" />
        <app-input-text v-model="contactPhone" class="input mb-3" placeholder="Телефон" />
        <app-button
          @click="addNewInterview"
          label="Создать заявку"
          :disabled="disabledSaveButton"
          :loading="loading"
        ></app-button>
      </template>
    </app-card>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
}
.content-interview {
  max-width: 600px;
  margin: auto;
}
</style>
