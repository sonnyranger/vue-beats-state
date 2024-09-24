<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore'

import type { IInterview } from '@/interfaces'
import { useUserStore } from '@/stores/user'
import { useConfirm } from 'primevue/useconfirm'

const userStore = useUserStore()
const db = getFirestore()
const confirm = useConfirm()

const interviews = ref<IInterview[]>([])
const isLoading = ref<boolean>(true)
const selectedFilterResult = ref<string>('')

const submitFilter = async (): Promise<void> => {
  isLoading.value = true
  const listInterviews: Array<IInterview> = await getAllInterviews(true)
  interviews.value = listInterviews
  isLoading.value = false
}

const clearFilter = async (): Promise<void> => {
  isLoading.value = true
  const listInterviews: Array<IInterview> = await getAllInterviews()
  interviews.value = listInterviews
  isLoading.value = false
}
const getAllInterviews = async <T extends IInterview>(isFilter?: boolean): Promise<T[]> => {
  let getData

  if (isFilter) {
    getData = query(
      collection(db, `users/${userStore.userId}/interviews`),
      orderBy('createdAt', 'desc'),
      where('result', '==', selectedFilterResult.value)
    )
  } else {
    getData = query(
      collection(db, `users/${userStore.userId}/interviews`),
      orderBy('createdAt', 'desc')
    )
  }

  const listDocs = await getDocs(getData)
  return listDocs.docs.map((doc) => {
    return doc.data() as T
  })
}

onMounted(async () => {
  const listInterviews: Array<IInterview> = await getAllInterviews()
  interviews.value = listInterviews
  isLoading.value = false
})

const confirmRemoveInterview = async (id: string): Promise<void> => {
  confirm.require({
    message: 'Вы действительно хотите удалить заявку?',
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
    <app-progress class="flex justify-content-center" v-if="isLoading" />
    <app-message v-else-if="!isLoading && interviews.length === 0" severity="info">
      Нет заявок
    </app-message>
    <div v-else>
      <h1>Список заявок</h1>
      <div class="flex align-items-center mb-5">
        <div class="flex align-items-center mr-2">
          <app-radio
            v-model="selectedFilterResult"
            inputId="interviewResult1"
            name="result"
            value="Refusal"
          />
          <label class="ml-2" for="interviewResult1">Отклонено</label>
        </div>
        <div class="flex align-items-center mr-2">
          <app-radio
            v-model="selectedFilterResult"
            inputId="interviewResult2"
            name="result"
            value="Offer"
          />
          <label class="ml-2" for="interviewResult2">Принято</label>
        </div>
        <app-button class="mr-2" @click="submitFilter" :disabled="!selectedFilterResult"
          >Применить</app-button
        >
        <app-button
          class="mr-2"
          severity="danger"
          :disabled="!selectedFilterResult"
          @click="clearFilter"
          >Сбросить</app-button
        >
      </div>
      <app-datatable :value="interviews">
        <app-column field="artist" header="Артист"></app-column>
        <app-column field="managerName" header="Контакт менеджера"></app-column>
        <app-column field="publicLink" header="Ссылка на паблик VK">
          <template #body="slotProps">
            <a :href="slotProps.data.publicLink" target="_blank">Ссылка на паблик</a>
          </template>
        </app-column>
        <app-column header="Контакты">
          <template #body="slotProps">
            <div class="contacts">
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
            </div>
          </template>
        </app-column>
        <app-column header="Пройденные этапы">
          <template #body="slotProps">
            <span v-if="!slotProps.data.stages">Не заполнено</span>
            <div v-else class="interview-stages">
              <app-badge
                v-for="(stage, i) in slotProps.data.stages"
                :key="i"
                :value="i + 1"
                severity="warn"
                rounded
                v-tooltip.top="stage.name"
              />
            </div>
          </template>
        </app-column>
        <app-column header="Бюджет на продвижение">
          <template #body="slotProps">
            <span v-if="!slotProps.data.salaryFrom">Не заполнено</span>
            <span v-else>{{ slotProps.data.salaryFrom }} - {{ slotProps.data.salaryTo }}</span>
          </template>
        </app-column>
        <app-column header="Результат">
          <template #body="slotProps">
            <app-badge v-if="!slotProps.data.result" value="Ожидание" severity="info"></app-badge>
            <template v-else>
              <app-badge
                :severity="slotProps.data.result === 'Offer' ? 'success' : 'danger'"
                :value="slotProps.data.result === 'Offer' ? 'Принято' : 'Отклонено'"
              ></app-badge>
            </template>
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
}
.interview-stages {
  display: flex;
  gap: 5px;
}
</style>
