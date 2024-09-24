<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import type { IInterview, IStage } from '@/interfaces'
import { useRoute } from 'vue-router'

const db = getFirestore()
const userStore = useUserStore()
const route = useRoute()

const isLoading = ref<boolean>(true)
const interview = ref<IInterview>()

const docref = doc(db, `users/${userStore.userId}/interviews`, route.params.id as string)

const getData = async (): Promise<void> => {
  isLoading.value = true
  const docSnap = await getDoc(docref)

  if (docSnap.exists()) {
    const data = docSnap.data() as IInterview
    if (data.stages && data.stages.length > 0) {
      data.stages = data.stages.map((stage: IStage) => {
        if (stage.date && stage.date instanceof Timestamp) {
          return { ...stage, date: stage.date.toDate() }
        }
        return stage
      })
    }
    interview.value = data
  }

  isLoading.value = false
}

const addStage = () => {
  if (interview.value) {
    if (!interview.value.stages) {
      interview.value.stages = []
    }

    interview.value.stages.push({ name: '', date: null, description: '' })
  }
}

const removeStage = (index: number) => {
  if (interview.value) {
    interview.value.stages?.splice(index, 1)
  }
}

const saveInterview = async (): Promise<void> => {
  isLoading.value = true

  await updateDoc(docref, { ...interview.value })
  await getData()

  isLoading.value = false
}

onMounted(async () => {
  await getData()
})
</script>

<template>
  <app-progress v-if="isLoading" />
  <div v-else-if="interview?.id && !isLoading" class="content-interview">
    <app-card>
      <template #title>Редактирование заявки артиста {{ interview.artist }}</template>
      <template #content>
        <div class="flex flex-column gap-2">
          <label for="artist">Артист</label>
          <app-input-text class="input mb-3" id="artist" v-model="interview.artist" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="publicLink">Ссылка на паблик VK</label>
          <app-input-text class="input mb-3" id="publicLink" v-model="interview.publicLink" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="managerName">Контакт (имя)</label>
          <app-input-text class="input mb-3" id="managerName" v-model="interview.managerName" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactTelegram">Telegram</label>
          <app-input-text
            class="input mb-3"
            id="contactTelegram"
            v-model="interview.contactTelegram"
          />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactWhatsApp">WhatsApp</label>
          <app-input-text
            class="input mb-3"
            id="contactWhatsApp"
            v-model="interview.contactWhatsApp"
          />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactPhone">Телефон</label>
          <app-input-text class="input mb-3" id="contactPhone" v-model="interview.contactPhone" />
        </div>
        <div class="flex flex-wrap gap-3 p-fluid mb-3">
          <div class="flex-auto">
            <app-input-number
              inputId="salaryFrom"
              placeholder="Бюджет на продвижение от"
              v-model="interview.salaryFrom"
            />
          </div>
          <div class="flex-auto">
            <app-input-number
              inputId="salaryTo"
              placeholder="Бюджет на продвижение до"
              v-model="interview.salaryTo"
            />
          </div>
        </div>

        <app-button
          class="mb-3"
          label="Добавить этап"
          severity="info"
          icon="pi pi-plus"
          @click="addStage"
        />
        <template v-if="interview.stages">
          <div v-for="(stage, index) in interview.stages" :key="index" class="interview-stage">
            <div class="flex flex-column gap-2">
              <label :for="`stage-name-${index}`">Название этапа</label>
              <app-input-text v-model="stage.name" class="input mb-3" :id="`stage-name-${index}`" />
            </div>
            <div class="flex flex-column gap-2">
              <label :for="`stage-date-${index}`">Дата прохождения этапа</label>
              <app-calendar
                class="input mb-3"
                :id="`stage-date-${index}`"
                dateFormat="dd.mm.yy"
                v-model="stage.date"
              />
            </div>
            <div class="flex flex-column gap-2">
              <label :for="`state-description-${index}`">Комментарий</label>
              <app-textarea
                :id="`state-description-${index}`"
                class="input mb-3"
                rows="5"
                v-model="stage.description"
              />
            </div>
            <app-button
              @click="removeStage(index)"
              class="mb-3"
              label="Удалить этап"
              severity="danger"
              icon="pi pi-trash"
            />
          </div>
        </template>
        <div class="flex flex-wrap gap-3 mb-3">
          <div class="flex align-items-center">
            <app-radio
              v-model="interview.result"
              inputId="interviewResult1"
              name="result"
              value="Refusal"
            />
            <label class="ml-2" for="interviewResult1">Отклонено</label>
          </div>
          <div class="flex align-items-center">
            <app-radio
              v-model="interview.result"
              inputId="interviewResult2"
              name="result"
              value="Offer"
            />
            <label class="ml-2" for="interviewResult1">Принято</label>
          </div>
        </div>
        <app-button @click="saveInterview" label="Сохранить" severity="info" icon="pi pi-save" />
      </template>
    </app-card>
  </div>
</template>

<style scoped>
.content-interview {
  max-width: 600px;
  margin: auto;
}
.input {
  width: 100%;
}
.interview-stage {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
