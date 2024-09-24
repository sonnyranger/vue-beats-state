export interface IInterview {
  id: string
  artist: string
  publicLink: string
  managerName: string
  contactTelegram?: string
  contactWhatsApp?: string
  contactPhone?: string
  createdAt: Date
  salaryFrom?: number
  salaryTo?: number
  stages?: IStage[]
  result?: 'Refusal' | 'Offer'
}

export interface IStage {
  name: string
  date: null | Date
  description: string
}
