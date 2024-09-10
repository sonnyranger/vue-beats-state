<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'

import type { IInterview } from '@/interfaces'
import { useUserStore } from '@/stores/user'
import { useConfirm } from 'primevue/useconfirm'

const userStore = useUserStore()
const db = getFirestore()
const confirm = useConfirm()

const interviews = ref<IInterview[]>([])
const isLoading = ref<boolean>(true)

const getAllInterviews = async <T extends IInterview>(): Promise<T[]> => {
  const getData = query(
    collection(db, `users/${userStore.userId}/interviews`),
    orderBy('createdAt', 'desc')
  )
  const listDocs = await getDocs(getData)
  return listDocs.docs.map((doc) => {
    return doc.data() as T
  })
}

onMounted(async () => {
  const listInterviews: Array<IInterview> = await getAllInterviews()
  interviews.value = [...listInterviews]
  isLoading.value = false
})

const confirmRemoveInterview = async (id: string): Promise<void> => {
  confirm.require({
    message: 'Вы действительно хотите удалить инструментал?',
    header: 'Подтвердите действие',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Отмена',
    acceptLabel: 'Удалить',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      isLoading.value = true
      await deleteDoc(doc(db, `users/${userStore.userId}/interviews`, id))
      const listInterviews: Array<IInterview> = await getAllInterviews()
      interviews.value = [...listInterviews]
      isLoading.value = false
    }
  })
}
</script>

<template>
  <div>
    <app-dialog />
    <app-progress v-if="isLoading" />
    <app-message v-else-if="!isLoading && interviews.length === 0" severity="info">
      Нет отправленных инструменталов
    </app-message>
    <div v-else>
      <h1>Список отправленных инструменталов</h1>
      <app-datatable :value="interviews">
        <app-column field="company" header="Артист"></app-column>
        <app-column field="hrName" header="Контакт менеджера"></app-column>
        <app-column field="vacancyLink" header="Ссылка на паблик">
          <template #body="slotProps">
            <a :href="slotProps.data.vacancyLink" target="_blank">{{
              slotProps.data.vacancyLink
            }}</a>
          </template>
        </app-column>
        <app-column class="flex justify-content-center" field="contactTelegram" header="Контакты">
          <template #body="slotProps">
            <a
              v-if="slotProps.data.contactTelegram"
              :href="`https://t.me/${slotProps.data.contactTelegram}`"
              target="_blank"
            >
              <span class="contacts__icon contacts__telegram pi pi-telegram"></span>
            </a>
            <a
              v-if="slotProps.data.contactWhatsApp"
              :href="`https://wa.me/${slotProps.data.contactWhatsApp}`"
              target="_blank"
            >
              <span class="contacts__icon contacts__whatsapp pi pi-whatsapp"></span>
            </a>

            <a
              v-if="slotProps.data.contactPhone"
              :href="`tel:${slotProps.data.contactPhone}`"
              target="_blank"
              class="contacts__phone"
            >
              <span class="contacts__icon pi pi-phone"></span>
            </a>
          </template>
        </app-column>
        <app-column>
          <template #body="slotProps">
            <div class="flex gap-2">
              <router-link :to="`/interview/${slotProps.data.id}`">
                <app-button icon="pi pi-pencil" severity="info"></app-button>
              </router-link>

              <app-button
                icon="pi pi-trash"
                severity="danger"
                @click="confirmRemoveInterview(slotProps.data.id)"
              ></app-button>
            </div>
          </template>
        </app-column>
      </app-datatable>
    </div>
  </div>
</template>

<style scoped>
.contacts {
  display: flex;
  align-items: center;
  gap: 20px;
}
.contacts__telegram {
  color: #0088cc;
}
.contacts__whatsapp {
  color: #25d366;
}
.contacts__phone {
  color: #371777;
}
.contacts__icon {
  font-size: 20px;
  margin: 10px;
}
</style>
